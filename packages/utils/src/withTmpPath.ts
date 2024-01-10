/*
 * @author: yanxianliang
 * @date: 2024-01-10 16:49
 * @desc: 获取临时文件路径，适配Windows等不同系统
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */

import {join} from "path";
import {IApi} from "umi";
import {winPath} from "umi/plugin-utils";

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
