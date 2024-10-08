/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-30 15:06:06
 * @Description: sentry 文件生成
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
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

export const defaultErrorFilters = [
  "promise rejection",
  "chrome.loadTimes() is deprecated",
  "Request aborted",
  "ResizeObserver",
  "Failed to fetch",
  "RequestError: timeout",
];

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
          /**ignore errors */
          ignore: zod.array(zod.string()).optional(),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  const commitId = await simpleGit()
    .revparse(["--short", "HEAD"])
    .catch(() => "not_git_repo");

  api.modifyDefaultConfig((memo) => {
    if (isProduction && api.name === "build") {
      memo.devtool = memo.devtool || "source-map";
    }
    return memo;
  });

  api.chainWebpack((memo, { webpack, env }) => {
    if (api.name === "build" && isProduction) {
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
    }
  });

  // runtime 修改
  const tmpDir = winPath(__dirname);
  api.onGenerateFiles(() => {
    const {
      dsn,
      ignore = defaultErrorFilters,
    } = api.config.sentry;

    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(tmpDir, "runtime.tsx.tpl"),
      context: {
        dsn: dsn,
        debug: !isProduction,
        disabled: !isProduction,
        ignore: JSON.stringify(ignore),
        release: isProduction? undefined: 'local'
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
    if(!fs.existsSync(dir)) return;
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
