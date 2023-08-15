/*
 * @author: yanxianliang
 * @date: 2023-08-15 16:02
 * @desc: Webpack Plugin for git diff
 *
 * Copyright (c) 2023 by yanxianliang, All Rights Reserved.
 */

import {simpleGit} from "simple-git";
import {join} from 'path';

const git = simpleGit({baseDir: process.cwd()});


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
}


const cwd_path = process.cwd();


function isInCommon(commonDirs: string[], file_path: string) {
  return commonDirs.find((dir: string) => file_path.startsWith(dir));
}


class ChangeAnalyzerPlugin {
  private readonly options: { sitBranch?: string; mainBranch?: string; commonDirs?: string } = {};

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

      const {sitBranch, mainBranch, commonDirs} = this.options;

      if (!sitBranch || !mainBranch || !commonDirs) {
        console.log('---------------------git diff report: 配置不完善----------------------');
        callback();
        return;
      }

      const diff = await git.diffSummary([mainBranch, sitBranch]);
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
        const parentSet = new Set();

        const key = 'userRequest';// 还是使用 resource？？
        const modules = stats.compilation.modules;
        const moduleGraph = stats.compilation.moduleGraph;

        function checkModules(modules: Array<Module> | Set<Module>) {
          modules.forEach(_ => {
            if (_[key] && _[key] === filePath) {
              const reasons: Module['reasons'] = _.reasons ? _.reasons : moduleGraph ? Array.from(moduleGraph.getIncomingConnections(_)) : undefined;
              if (reasons) {
                reasons.forEach(reason => {
                  const dependency = reason.dependency;
                  const originModule = reason.originModule;
                  if (originModule) {
                    // webpack 5.0
                    const file = originModule[key];
                    if(isInCommon(commonDirList,file)){
                      const parents = getRelationParent(file);
                      parents.forEach(p=>parentSet.add(p));
                    }else{
                      parentSet.add(file);
                    }
                  }
                  // webpack 4.0
                  if (dependency) {
                    if (dependency) {
                      const originModule = dependency.originModule;
                      if (originModule) {
                        const file = originModule[key];
                        if(isInCommon(commonDirList,file)){
                          const parents = getRelationParent(file);
                          parents.forEach(p=>parentSet.add(p));
                        }else{
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

      publicFiles.forEach(originFile => {
        const relationParent = getRelationParent(originFile);
        console.log(`改动文件：${originFile},影响文件：${relationParent}`);
      });


      callback();
    };

    if (compiler.hooks) {
      compiler.hooks.done.tapAsync('webpack-bundle-analyzer', done);
    } else {
      compiler.plugin('done', done);
    }
  }
}

export {ChangeAnalyzerPlugin};
