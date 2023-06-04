/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-30 15:06:06
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { join } from "path";
import { IApi } from "umi";
import { winPath } from "umi/plugin-utils";

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
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.register,
  });


  // runtime 修改
  const tmpDir = winPath(__dirname);
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(tmpDir, "runtime.tsx.tpl"),
      context: {},
    });
  });

  api.addRuntimePluginKey(() => ["history-inject"]);
  api.addRuntimePlugin({
    fn: () => withTmpPath({ api, path: "runtime.tsx" }),
    stage: -1 * Number.MAX_SAFE_INTEGER,
  });
};
