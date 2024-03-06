/*
 * @Author: yanxlg
 * @Date: 2023-04-27 11:38:53
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-19 10:41:11
 * @Description:
 * 属性优先级：props > runtime > config
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {join} from "path";
import {IApi} from "umi";
// import {winPath} from "umi/plugin-utils";
//
// function withTmpPath(opts: {
//   api: IApi;
//   path: string;
//   noPluginDir?: boolean;
// }) {
//   return winPath(
//     join(
//       opts.api.paths.absTmpPath,
//       opts.api.plugin.key && !opts.noPluginDir
//         ? `plugin-${opts.api.plugin.key}`
//         : "",
//       opts.path
//     )
//   );
// }

// 构建时间大大增加
export default (api: IApi) => {
  api.describe({
    key: "modifyDefaultProps",
    config: {
      schema({zod}) {
        return zod.array(zod.object({
          match: zod.string(),
          identifier: zod.string(),
          defaultProps: zod.any()
        }));
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });
  api.addExtraBabelPlugins(() => [
    [
      join(__dirname, 'babel'),
      {
        modifies: api.config.modifyDefaultProps
      }
    ]
  ]);
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: "babel.js",
      tplPath: join(__dirname, "babel.js"),
      context: {},
    });
  });
};
