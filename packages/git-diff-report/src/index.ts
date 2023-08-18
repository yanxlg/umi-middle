/*
 * @author: yanxianliang
 * @date: 2023-08-15 16:02
 * @desc: Webpack Plugin for git diff
 *
 * Copyright (c) 2023 by yanxianliang, All Rights Reserved.
 */

import {simpleGit} from "simple-git";
import {join} from 'path';
import dayjs from 'dayjs';
import * as fs from 'fs';

import {parse} from './parser';

const git = simpleGit({baseDir: process.cwd()});

const request = require('request');

type Reason = {
  dependency: {
    originModule?: Module;
  };
  originModule: Module
}

type Module = {
  userRequest: string;
  request: string;
  reasons?: Array<Reason>;
  modules?: Array<Module>;
  _source?: { _value?: string };
}


const cwd_path = process.cwd();


function isInCommon(commonDirs: string[], file_path: string) {
  return commonDirs.find((dir: string) => file_path.startsWith(dir));
}


export class ChangeAnalyzerPlugin {
  private readonly options: {
    sitBranch?: string;
    mainBranch?: string;
    commonDirs?: string;
    webhook?: string;
    users?: string[];
  } = {};

  constructor(opts = {}) {
    this.options = opts;
  }

  apply(compiler: {
    hooks?: { done: { tapAsync: (event: string, callback: Function) => void } };
    plugin: (event: string, callback: Function) => void;
  }) {
    const done = async (stats: {
      compilation: {
        modules: Module[] | Set<Module>;
        moduleGraph: { getIncomingConnections: (module: Module) => Reason[]; }
      }
    }, callback: Function) => {
      callback = callback || (() => {
      });

      const {sitBranch, mainBranch, commonDirs, webhook, users} = this.options;

      if (!sitBranch || !mainBranch || !commonDirs || !webhook) {
        console.log('---------------------git diff report: 配置不完善----------------------');
        callback();
        return;
      }

      const {current: _current, all} = await git.branch(); // 是不是所有的远程分支都能拿到
      const current = process.env.CI_COMMIT_REF_NAME || _current;

      if (current !== sitBranch) {
        console.log(`---------------------git diff report: ${current}分支不做检测----------------------`);
        callback();
        return;
      }

      const diff = await git.diffSummary([`origin/${mainBranch}`, `origin/${sitBranch}`]);
      const {files} = diff;

      const commonDirList = commonDirs.split(',').map(_ => join(cwd_path, _));

      const publicFiles = files.map(_ => join(cwd_path, _.file)).filter(_ => {
        return isInCommon(commonDirList, _);
      });

      if (publicFiles.length === 0) {
        console.log('---------------------git diff report: no file change----------------------');
        callback();
        return;
      }


      // 1. 检查分支是否满足检测需要 ==> 默认sit分支，支持配置其它分支

      // 2. diff当前分支与master分支，获取修改文件列表

      // 3. 获取修改文件对应的父级引用文件地址，需要排除公共部分，公共部分目录通过配置传入，查找公共部分以外的父级。

      // 4. 机器人发送通知，生成修改文件对应的excel文档，发送到产研群，由前端研发补齐具体页面/场景描述。


      // 需要溯源到非公共目录
      function getRelationParent(filePath: string) {
        const parentSet = new Set();  // 获取对应文件的注释，通过注释解析文件解释。

        const key = 'userRequest';// 还是使用 resource？？
        const modules = stats.compilation.modules;
        const moduleGraph = stats.compilation.moduleGraph;

        function checkModules(modules: Array<Module> | Set<Module>) {
          modules.forEach(_ => {
            if (_[key] && _[key] === filePath) {
              // 读取内容
              const content = fs.readFileSync(filePath).toString('utf-8');
              parse(content, {}, (parsedObject: any) => {
                console.log(parsedObject)
              })

              const reasons: Module['reasons'] = _.reasons ? _.reasons : moduleGraph ? Array.from(moduleGraph.getIncomingConnections(_)) : undefined;
              if (reasons) {
                reasons.forEach(reason => {
                  const dependency = reason.dependency;
                  const originModule = reason.originModule;
                  if (originModule) {
                    // webpack 5.0
                    const file = originModule[key];
                    if (isInCommon(commonDirList, file)) {
                      const parents = getRelationParent(file);
                      parents.forEach(p => parentSet.add(p));
                    } else {
                      parentSet.add(file);
                    }
                  }
                  // webpack 4.0
                  if (dependency) {
                    if (dependency) {
                      const originModule = dependency.originModule;
                      if (originModule) {
                        const file = originModule[key];
                        if (isInCommon(commonDirList, file)) {
                          const parents = getRelationParent(file);
                          parents.forEach(p => parentSet.add(p));
                        } else {
                          parentSet.add(file);
                        }
                      }
                    }
                  }
                });
              }
            }
            const subModules = _.modules;
            if (subModules) {
              checkModules(subModules);
            }
          });
        }

        checkModules(modules);

        return Array.from(parentSet);
      }


      const changeList: Array<{
        source: string;
        dependencies: string[];
      }> = [];

      publicFiles.forEach(originFile => {
        const relationParent = getRelationParent(originFile) as string[];
        changeList.push({
          source: originFile,
          dependencies: relationParent
        })
      });


      const logs = await git.log();

      const submitList = logs.all.filter(submit => dayjs().diff(dayjs(submit.date), 'day') < 14);

      const wechatMsg = {
        "msgtype": "markdown",
        "markdown": {
          "content": '## 文件影响范围:\n\n' +
            "> 公共组件/模块 修改 所关联的引用文件，研发与测试根据此可确定回归范围\n\n" +
            changeList.map(change => `**[公共文件变更]**：${change.source.replace(cwd_path, '')}\n**[关联文件]**：\n${change.dependencies.map(dep => dep.replace(cwd_path, '')).join('\n')}`).join('\n\n\n\n') +
            "\n\n\n\n## 提交记录:\n\n" +
            `> 近2周共${submitList.length}commit\n\n` +
            submitList.slice(0, 3).map(log => `[提交人]:${log.author_name} \n[提交日期]:${log.date} \n[提交说明]:${log.message}`).join('\n\n\n\n') +
            "\n\n\n\n请对应研发和测试参考以上内容进行回归" +
            users?.map(user => `<@${user}>`).join(''),
        },
      }

      // 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=90d04116-5345-45b8-92a9-c156c1e905f1'
      request({
        url: webhook,
        method: "POST",
        body: JSON.stringify(wechatMsg)
      })
      callback();
    };

    if (compiler.hooks) {
      compiler.hooks.done.tapAsync('webpack-bundle-analyzer', done);
    } else {
      compiler.plugin('done', done);
    }
  }
}
