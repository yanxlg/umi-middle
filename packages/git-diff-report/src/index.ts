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
import {uniqBy} from "lodash";

import {parse} from './parser';

const git = simpleGit({baseDir: process.cwd()});

const request = require('request');

type Reason = {
  dependency: {
    originModule?: Module;
    module?: Module;
  };
  originModule: Module;
  module: Module;
}

type Module = {
  userRequest: string;
  request: string;
  reasons?: Array<Reason>;
  modules?: Array<Module>;
  _source?: { _value?: string };
}

type RelationTree = {
  path: string;
  meta?: {
    component?: string;
    util?: string;
    page?: string;
    module?: string;
  };
  parents?: RelationTree[]
}

type FlatRelationTree = { path: string; meta: RelationTree['meta']; parent?: FlatRelationTree }


const cwd_path = process.cwd();


function isInCommon(commonDirs: string[], file_path: string) {
  return commonDirs.find((dir: string) => file_path.startsWith(dir));
}


function getCommentBlocks(filePath: string) {
  const content = fs.readFileSync(filePath).toString('utf-8').replace(/^\s*\n*/, '');// 处理顶部空格和换行
  return parse(content, {});
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


      const leafMap = new Map<string, RelationTree>();


      // 需要溯源到非公共目录
      function getTreeLeaf(filePath: string, filesList: string[] = []) {
        const key = 'userRequest';// 还是使用 resource？？
        const modules = stats.compilation.modules;
        const moduleGraph = stats.compilation.moduleGraph;

        if (leafMap.has(filePath)) {
          return leafMap.get(filePath);
        }

        function isInDependence(path: string){
          return !!filesList.find(_=>_===path);
        }

        function checkModules(modules: Array<Module> | Set<Module>): RelationTree | undefined {
          for (let _ of modules) {
            if (_[key] && _[key] === filePath) { // 向上查找，如果引用在组件目录中。 需要做缓存，减少时间消耗。
              const blocks = getCommentBlocks(filePath);
              const block = blocks.find(block => !!block.meta.component || !!block.meta.util || !!block.meta.module || !!block.meta.page); // 组件、工具、模块、页面。
              const leaf: RelationTree = {
                path: filePath,
                meta: block?.meta,
                parents: []
              };
              leafMap.set(filePath, leaf); // 缓存
              const reasons: Module['reasons'] = _.reasons ? _.reasons : moduleGraph ? Array.from(moduleGraph.getIncomingConnections(_)) : undefined;
              if (reasons) {// 查找引用，父级
                reasons.forEach(reason => {
                  const dependency = reason.dependency;
                  const originModule = reason.originModule;

                  if (originModule) {
                    // webpack 5.0
                    const file = originModule[key];
                    if (filePath !== file && !isInDependence(file)) {
                      leaf.parents!.push(getTreeLeaf(file, [...filesList,file])!);
                      return;
                    }
                  }
                  // webpack 4.0
                  if (dependency) {
                    const originModule = dependency.originModule;
                    if (originModule) {
                      const file = originModule[key];
                      if (filePath !== file && !isInDependence(file)) {
                        leaf.parents!.push(getTreeLeaf(file, [...filesList,file])!);
                        return;
                      }
                    }
                  }


                  // 循环引用。
                  const module = reason.module; // webpack 3.x
                  if(module) {
                    const file = module[key];
                    if (filePath !== file && !isInDependence(file)) {
                      leaf.parents!.push(getTreeLeaf(file, [...filesList,file])!);
                      return;
                    }
                  }
                });
              }
              return leaf;
            }
            const subModules = _.modules;
            if (subModules) {
              const result = checkModules(subModules);
              if (result) {
                return result;
              }
            }
          }
        }

        return checkModules(modules);
      }


      const treeList = publicFiles.map(file => getTreeLeaf(file)).filter(Boolean) as RelationTree[];


      // 解释查找，如果无法找到则使用配置目录外的第一个文件地址作为范围提示。

     console.log(treeList);

      // 存在循环引用的情况，会死循环。怎么处理。整条链路上不能包括自己
      const flatTree = function (tree: RelationTree[]) {
        if (!tree || !tree.length) {
          return [undefined];// 空的，向上
        }
        const flatParent: Array<FlatRelationTree> = [];

        tree.forEach(leaf => {
          if(!leaf) return;
          const {parents=[]} = leaf;
          const _flatParent = flatTree(parents.filter(Boolean));
          _flatParent.forEach(p => {
            flatParent.push({
              path: leaf.path,
              meta: leaf.meta,
              parent: p
            });
          });
        });
        return flatParent;
      }

      const flatTreeList = flatTree(treeList);


      const changes = uniqBy(flatTreeList.map((leaf) => {
        const findByComponentName = function (leaf: FlatRelationTree):string|undefined {
          const {path, meta, parent} = leaf;
          if (!isInCommon(commonDirList, path)) {
            return undefined;
          }
          if (meta && meta.component) {
            return meta.component
          }
          if (parent) {
            return findByComponentName(parent);
          }
        }
        const findByUtilName = function (leaf: FlatRelationTree):string|undefined {
          const {path, meta, parent} = leaf;
          if (!isInCommon(commonDirList, path)) {
            return undefined;
          }
          if (meta && meta.util) {
            return meta.util
          }
          if (parent) {
            return findByUtilName(parent);
          }
        }
        const findModuleName = function (leaf: FlatRelationTree): string | undefined {
          const {path, meta, parent} = leaf;

          if (isInCommon(commonDirList, path) && parent) {
            return findModuleName(parent);
          }
          if (!isInCommon(commonDirList, path)) {
            if (meta && meta.module) {
              return meta.module
            }
          }

          if(parent){
            return findModuleName(parent);
          }
        }

        const findPageName = function (leaf: FlatRelationTree): string | undefined {
          const {path, meta, parent} = leaf;

          if (isInCommon(commonDirList, path) && parent) {
            return findPageName(parent);
          }
          if (!isInCommon(commonDirList, path)) {
            if (meta && meta.page) {
              return meta.page
            }
          }
          if(parent){
            return findPageName(parent);
          }
        }

        const findPrivateParentPath = function (leaf: FlatRelationTree): string|undefined {
          const {path, meta, parent} = leaf;

          if (isInCommon(commonDirList, path) && parent) {
            return findPrivateParentPath(parent);
          }
          if (!isInCommon(commonDirList, path)) {
            return leaf.path;
          }
        }

        if (leaf) {
          // 在公共目录范围内查找组件和工具
          return {
            rootPath: leaf.path,
            parentPath: findPrivateParentPath(leaf),
            component: findByComponentName(leaf),
            util: findByUtilName(leaf),
            module: findModuleName(leaf),
            page: findPageName(leaf)
          }
        }
        return undefined;
      }).filter(Boolean),item=>JSON.stringify(item));

      const logs = await git.log();

      const submitList = logs.all.filter(submit => dayjs().diff(dayjs(submit.date), 'day') < 14);


      // 构建消息内容
      const msgContent = [];
      msgContent.push('## 变更影响:\n\n');
      msgContent.push('> 对比master代码，存在差异的公共组件/工具类，及其关联的页面/模块，研发与测试根据此可确定回归范围\n\n');

      // 需要根据key聚合
      const changeMap = new Map<string,{
        pageModules?: string[];
        fileList?: string[];
        title: string;
      }>();
      changes.filter(Boolean).forEach(change=>{
        const {component,util,page,module,rootPath,parentPath} = change!;
        const title = component? `修改组件：${component}`: util? `修改工具类：${util}`: `修改文件：${rootPath}`;
        const key = JSON.stringify(change);
        if(!changeMap.has(key)){
          changeMap.set(key,{
            pageModules: [],
            fileList: [],
            title
          })
        }
        const pageModules = changeMap.get(key)?.pageModules!;
        const fileList = changeMap.get(key)?.fileList!;
        if(page){
          pageModules.push(`「${page}」页面${module?`-「${module}」模块`:''}`);
        }else if(parentPath){
          fileList.push(parentPath);
        }
      });


      changeMap.forEach((change)=>{
        if(!change.fileList?.length && !change.pageModules?.length){
          return; // TODO 没有影响模块的，有问题吧，为什么没有上层引用？？？怎么都会向上追溯，是因为异步导入原因？？？
        }
        msgContent.push(change.title);
        msgContent.push('\n');
        const {pageModules,fileList} = change;
        if(pageModules && pageModules.length){
          msgContent.push(`影响模块：${pageModules.join('、')}`);
          msgContent.push('\n');
        }
        if(fileList && fileList.length){
          msgContent.push(`影响文件(未备注模块/页面名)：${fileList.join('、')}`);
        }
        msgContent.push('\n\n\n');
      })
      msgContent.push("\n\n\n\n## 提交记录:\n\n");
      msgContent.push( `> 近2周共${submitList.length}commit\n\n`);

      submitList.forEach(log => msgContent.push(`[提交人]:${log.author_name} \n[提交日期]:${log.date} \n[提交说明]:${log.message}\n\n\n\n`));
      msgContent.push("\n\n\n\n请对应研发和测试参考以上内容进行回归");
      users?.forEach(user => msgContent.push(`<@${user}>`));

      const wechatMsg = {
        "msgtype": "markdown",
        "markdown": {
          "content": msgContent.join(''),
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
