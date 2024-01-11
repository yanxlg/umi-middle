/*
 * @author: yanxianliang
 * @date: 2024-01-10 18:17
 * @desc: 布局处理
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */

import {IApi, RUNTIME_TYPE_FILE_NAME} from "umi";
import {checkDependence, withTmpPath} from "@middle-cli/utils";
import {winPath} from "umi/plugin-utils";
import {join} from "path";
import fs from 'fs';
import path from 'path';
import process from "process";

// 宽度配置放到runtime中，支持作为子应用时在mount中通过基座传递的props修改对应的初始化配置，并调用render渲染。
type LayoutPluginConfig = {
  type?: 'antd@4' | 'antd@5' | 'yh-design', // ui组件，不配置则内部自动检测
}

const tmpDir = winPath(join(__dirname, "..", "template")); // 模版目录

const isDevelopment = process.env.NODE_ENV !== "production";

function writeDirectory(templateDir: string, directoryPath: string, api: IApi) {
  // 读取指定路径下的所有文件和子目录
  const filesAndDirectories = fs.readdirSync(directoryPath);
  for (let i = 0; i < filesAndDirectories.length; i++) {
    const fileOrDirName = filesAndDirectories[i];
    const itemPath = path.join(directoryPath, fileOrDirName);
    if (fs.statSync(itemPath).isFile()) {
      if(/\.tpl$/.test(itemPath)){
        const useTabs = api.config.tabs;
        api.writeTmpFile({
          path: itemPath.replace(templateDir, 'layout').replace(/\.tpl$/,''),
          tplPath: itemPath,
          context: {
            isDevelopment,
            useTabs
          }
        })
      }else{
        api.writeTmpFile({
          path: itemPath.replace(templateDir, 'layout').replace(/\.tpl$/,''), // 生成目录文件
          content: fs.readFileSync(itemPath, "utf-8")
        });
      }
    } else if (fs.statSync(itemPath).isDirectory()) {
      writeDirectory(templateDir, itemPath, api);
    }
  }
}

const {useAntd, antdVersion, useYhDesign} = checkDependence();


function getLayoutUiType(type: LayoutPluginConfig['type']) {
  switch (type){
    // @ts-ignore
    case 'yh-design':
      if(useYhDesign){
        return type;
      }
    // @ts-ignore
    case 'antd@4':
      if(useAntd && parseInt(antdVersion) ===4){
        return type;
      }
    // @ts-ignore
    case 'antd@5':
      if(useAntd && parseInt(antdVersion) ===5){
        return type;
      }
    default:
      // 执行自动检测
      if(useAntd && parseInt(antdVersion) ===4){
        return 'antd@4';
      }
      if(useAntd && parseInt(antdVersion) ===5){
        return 'antd@5';
      }
      if(useYhDesign){
        return 'yh-design';
      }
  }
}

export function resolveLayout(api: IApi) {
  api.addRuntimePluginKey(() => ["hcLayout"]);
  api.addLayouts(() => {
    // 需要检测是否有效吧，否则文件不存在不是白搭
    const layoutFile = withTmpPath({api, path: "layout/index.tsx"});
    console.log('layout-file：', layoutFile, fs.existsSync(layoutFile));
    if (fs.existsSync(layoutFile)) {
      return [{
        id: 'hc-layout',
        file: withTmpPath({api, path: "layout/index.tsx"}),
        test: (route: { layout?: boolean }) => {
          return route.layout !== false; // layout 可以配置，从而部分页面不加载布局。
        }
      }]
    }
    return [];
  });
  api.onGenerateFiles(() => {
    const layoutPluginConfig = api.config.hc.layout as LayoutPluginConfig;
    if (layoutPluginConfig) {
      // 配置了值
      let type = getLayoutUiType(layoutPluginConfig.type);
      if (!type) {
        api.logger.error('未检测到相关的ui组件库依赖，无法生成对应的布局组件，当前支持 antd@4、@antd@5、yh-design');
        return;
      }
      const templateDir = path.join(tmpDir, `layout/${type}`);
      writeDirectory(templateDir, templateDir, api);

      api.writeTmpFile({
        path: RUNTIME_TYPE_FILE_NAME,
        tplPath: join(tmpDir, "runtimeConfig.d.ts"),
        context: {}
      });
    }
  });
}
