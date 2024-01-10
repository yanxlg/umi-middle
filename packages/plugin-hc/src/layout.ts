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

const tmpDir = winPath(join(__dirname, "..", "template"));


function writeDirectory(templateDir: string, directoryPath: string, api: IApi) {
  // 读取指定路径下的所有文件和子目录
  const filesAndDirectories = fs.readdirSync(directoryPath);
  for (let i = 0; i < filesAndDirectories.length; i++) {
    const fileOrDirName = filesAndDirectories[i];
    const itemPath = path.join(directoryPath, fileOrDirName);
    if (fs.statSync(itemPath).isFile()) {
      api.writeTmpFile({
        path: itemPath.replace(templateDir, 'layout'), // 生成目录文件
        content: fs.readFileSync(itemPath, "utf-8")
      })
    } else if (fs.statSync(itemPath).isDirectory()) {
      writeDirectory(templateDir, itemPath, api);
    }
  }
}

export function resolveLayout(api: IApi){
  const {useAntd, antdVersion, useYhDesign} = checkDependence();
  api.addRuntimePluginKey(() => ["hcLayout", "onHcSiderCollapse"]);// runtime中函数注册支持
  api.addLayouts(() => {
    // 需要检测是否有效吧，否则文件不存在不是白搭
    const layoutFile = withTmpPath({api, path: "layout/index.tsx"});
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
    const config = api.config;
    // layout 生成
    let generateLayout = config.hc.layout;
    let message = '';
    if (!!generateLayout) {
      if (generateLayout === true) {
        // 从node_modules 中自动检测
        if (useAntd) {
          switch (parseInt(antdVersion)) {
            case 4:
              generateLayout = 'antd@4';
              break;
            case 5:
              generateLayout = 'antd@5';
              break;
            default:
              message = '当前antd 版本未支持Layout，请联系脚手架人员支持';
              break;
          }
        }
        if (generateLayout === true && useYhDesign) {
          generateLayout = 'yh-design'
        }
      }
      if (generateLayout === true) {
        // 未检测到
        if (message) {
          api.logger.error(message);
        }
        generateLayout = false;
      }

      if (generateLayout) {
        const templateDir = path.join(tmpDir, `layout/${generateLayout}`);
        writeDirectory(templateDir, templateDir, api);
      }
    }

    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
type LayoutType = {
  sideMenuMin?: number;
  sideMenuMax?: number;
  contentBoxPadding?: number;
};
export interface IRuntimeConfig {
  hcLayout?: ()=>LayoutType;
  onSiderCollapse?: (collapsed: boolean)=>void;
}
      `,
    });

    // 调用html-css-property 插件，添加变量。 大小只能在umi 配置中设置，需要直接生成到html中，组件中创建会
  });
}
