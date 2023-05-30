/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-27 12:10:15
 * @Description:
 * 检查是不是存在view.tsx|view.jsx 如果支持，表示组件在编辑器中和。view.js 支持。  __editMode 属性。如果有的话原属性直接传过来，不处理（editable、children等）。
 * meta.json | meta.ts | meta.tsx  支持default导出，支持 meta 属性导出。
 *
 * 拆分包。渲染态、编辑态。渲染态数据精简。只需要
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
// 读取本地目录，生成对应的入口文件。 index.ts 是不是也可以不需要了？？？或者
import fs from "fs";
import { join } from "path";
import simpleGit from "simple-git";
import { IApi } from "umi";
import { winPath } from "umi/plugin-utils";

// 降级，不能使用>2版本，与后台不匹配，源码不能正常上传
import SentryWebpackPlugin from "@sentry/webpack-plugin";

const isProduction = process.env.NODE_ENV === "production";
export function withTmpPath(opts: {
  api: IApi;
  path: string;
  noPluginDir?: boolean;
}) {
  return winPath(
    join(
      opts.api.paths.absTmpPath,
      opts.api.plugin.key && !opts.noPluginDir
        ? `plugin-${opts.api.plugin.key}`
        : "",
      opts.path
    )
  );
}

export default async (api: IApi) => {
  api.describe({
    key: "sentry",
    config: {
      schema({ zod }) {
        return zod.object({
          /** sentry org */
          org: zod.string().optional(),
          /** sentry project */
          project: zod.string(),
          /** sentry domain */
          url: zod.string().optional(),
          /** sentry auth token */
          authToken: zod.string(),
          /** sentry dsn */
          dsn: zod.string(),
          /** environment tag */
          environment: zod.string().optional(),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  const commitId = await simpleGit()
    .revparse(["--short", "HEAD"])
    .catch(() => "not_git_repo");

  if (isProduction) {
    api.chainWebpack((memo, { webpack, env }) => {
      const {
        org = "yonghui",
        project,
        url = "https://sentry.yonghuivip.com",
        authToken,
      } = api.config.sentry;
      // 本地build 不需要上传源码，怎么检测是否是本地。
      const outputPath = api.config.outputPath || "dist";
      memo.plugin("SentryWebpackPlugin").use(SentryWebpackPlugin, [
        {
          org: org,
          project: project,
          url: url,
          authToken: authToken,
          include: [outputPath],
          urlPrefix: "~/",
          release: commitId,
          runOnce: true,
          cleanArtifacts: true,
          debug: false,
        },
      ]);
    });
  }

  // runtime 修改
  const tmpDir = winPath(__dirname);
  api.onGenerateFiles(() => {
    const { dsn, environment = "__runtime_env__sentry_environment__" } =
      api.config.sentry;
    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(tmpDir, "runtime.tsx.tpl"),
      context: {
        dsn: dsn,
        environment,
      },
    });
  });

  api.addRuntimePluginKey(() => ["sentry"]);
  // 最初创建，需要在plugin-model dataflowProvider之前
  api.addRuntimePlugin({
    fn: () => withTmpPath({ api, path: "runtime.tsx" }),
    stage: -1 * Number.MAX_SAFE_INTEGER,
  });

  function cleanSourceMapAfterUpload(dir: string) {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        return cleanSourceMapAfterUpload(filePath);
      }
      if (/\.map$/.test(filePath)) {
        fs.rmSync(filePath);
      }
      if (/\.css$/.test(filePath) || /\.js$/.test(filePath)) {
        fs.writeFileSync(
          filePath,
          fs
            .readFileSync(filePath, "utf8")
            .replace(/\/\*\# sourceMappingURL=.*/g, "")
            .replace(/\/\/\# sourceMappingURL=.*/g, "")
        );
      }
    });
  }

  api.onBuildComplete(({ isFirstCompile }) => {
    // clean sourcemap files
    // find ./dist -name "*.js.map" | xargs rm -rf
    const outputPath = api.config.outputPath || "dist";
    cleanSourceMapAfterUpload(outputPath);
  });
};
