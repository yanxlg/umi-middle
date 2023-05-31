/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-30 15:06:06
 * @Description: 运行时env覆盖
 *
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { join } from "path";
import { IApi } from "umi";
import { winPath } from "umi/plugin-utils";

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
    key: "injectEnv",
    config: {
      schema({ zod }) {
        return zod.record(zod.string(), zod.string());
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  // runtime 修改
  api.onGenerateFiles(() => {
    const vars = api.config.injectVars || {};
    const indexPath = join(__dirname, "index.ts.tpl");

    api.writeTmpFile({
      path: "index.ts",
      tplPath: indexPath,
      context: {
        vars: isProduction
          ? Object.keys(vars).map((key) => ({
              key: key,
              value: `__runtime_env__${key}__`,
            }))
          : Object.keys(vars).map((key) => ({
              key: key,
              value: vars[key],
            })),
        varKeys:Object.keys(vars).join(', ')
      },
    });
  });
};
