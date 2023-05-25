/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-25 17:22:25
 * @Description:
 * 检查是不是存在view.tsx|view.jsx 如果支持，表示组件在编辑器中和。view.js 支持。  __editMode 属性。如果有的话原属性直接传过来，不处理（editable、children等）。
 * meta.json | meta.ts | meta.tsx  支持default导出，支持 meta 属性导出。
 *
 * 拆分包。渲染态、编辑态。渲染态数据精简。只需要
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
// 读取本地目录，生成对应的入口文件。 index.ts 是不是也可以不需要了？？？或者
import { join } from "path";
import { simpleGit } from "simple-git";
import { IApi } from "umi";
import { winPath } from "umi/plugin-utils";

const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

export default async (api: IApi) => {
  api.describe({
    key: "sentry",
    config: {
      schema({ zod }) {
        return zod.object({
          /** sentry org */
          org: zod.string(),
          /** sentry project */
          project: zod.string(),
          /** sentry domain */
          url: zod.string(),
          /** sentry auth token */
          authToken: zod.string(),
          /** sentry dsn */
          dsn: zod.string(),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  const commitId = await simpleGit().revparse(["--short", "HEAD"]);
  api.chainWebpack((memo, { webpack, env }) => {
    // 本地build 不需要上传源码，怎么检测是否是本地。
    const sentryConfig = api.config.sentry;

    memo.plugin("sentryWebpackPlugin").use(sentryWebpackPlugin, [
      {
        org: sentryConfig.org,
        project: sentryConfig.project,
        url: sentryConfig.url,
        authToken: sentryConfig.authToken,
        sourcemaps: {
          // Specify the directory containing build artifacts
          assets: "./**",
          // Don't upload the source maps of dependencies
          ignore: ["./node_modules/**"],
        },
        release: commitId, // 获取当前git提交记录。
        debug: true,
      },
    ]);

    // runtime 修改
    const tmpDir = winPath(__dirname);
    api.onGenerateFiles(() => {
      api.writeTmpFile({
        path: "runtime.tsx",
        tplPath: join(tmpDir, "runtime.tsx.tpl"),
        context: {
          dsn: sentryConfig.dsn,
        },
      });
    });
  });
};
