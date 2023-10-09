/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-19 09:31:51
 * @Description:
 * 检查是不是存在view.tsx|view.jsx 如果支持，表示组件在编辑器中和。view.js 支持。  __editMode 属性。如果有的话原属性直接传过来，不处理（editable、children等）。
 * meta.json | meta.ts | meta.tsx  支持default导出，支持 meta 属性导出。
 *
 * 拆分包。渲染态、编辑态。渲染态数据精简。只需要
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
// 读取本地目录，生成对应的入口文件。 index.ts 是不是也可以不需要了？？？或者
import { IApi } from "umi";
const MonacoEditorWebpackPlugin = require("monaco-editor-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

export default (api: IApi) => {
  api.describe({
    key: "asset-dev",
    config: {
      onChange: api.ConfigChangeType.regenerateTmpFiles, // 发生变化之后重新生成文件
    },
    enableBy: api.EnableBy.register,
  });

  api.modifyConfig((memo, { paths }) => {
    // 地址
    memo.routes = [
      {
        path: "/",
        component: require.resolve("@meditor/designer/es/devtools/index.js"),
      },
    ];
    return memo;
  });

  api.chainWebpack((memo, { webpack, env }) => {
    memo
      .entry("sandbox")
      .add(require.resolve("@meditor/designer/es/devtools/sandbox/index.js")); // sandbox 配置不同的externals
    memo
      .plugin("MonacoEditorWebpackPlugin")
      .use(MonacoEditorWebpackPlugin, [
        { languages: ["css", "javascript", "typescript", "json", "less"] },
      ]);
  });
};
