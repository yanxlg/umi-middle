/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-19 00:25:17
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
    enableBy: api.EnableBy.register,
  });

  api.modifyConfig((memo, { paths }) => {
    // memo.externals = {
    //   ...memo.externals,
    //   "@formily/reactive": "Formily.Reactive", // iframe中获取到的是父页面全局变量。为什么需要用父元素的
    //   react: "React",
    //   "react-dom": "ReactDOM",
    // };
    // memo.headScripts = [
    //   `//unpkg.com/react@17.0.2/umd/react.production.min.js`,
    //   `//unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js`,
    //   `//unpkg.com/@formily/reactive@2.2.13/dist/formily.reactive.umd.${
    //     isDev ? "development" : "production"
    //   }.js`,
    // ];
    // 地址
    memo.routes = [
      {
        path: "/",
        component: require.resolve("@designable/designer/es/devtools/index.js"),
      },
    ];
    return memo;
  });

  api.chainWebpack((memo, { webpack, env }) => {
    memo
      .entry("sandbox")
      .add(
        require.resolve("@designable/designer/es/devtools/sandbox/index.js")
      ); // sandbox 配置不同的externals
    memo
      .plugin("MonacoEditorWebpackPlugin")
      .use(MonacoEditorWebpackPlugin, [
        { languages: ["css", "javascript", "typescript", "json", "less"] },
      ]);
  });
};
