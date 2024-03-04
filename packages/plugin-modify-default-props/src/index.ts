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
import {IApi, RUNTIME_TYPE_FILE_NAME} from "umi";
import {checkDependence} from "@middle-cli/utils";

type ModifyType = Array<{
  module: string;
  dirName?: string;// 支持多个
  identifier: string; // 组件变量名
  defaultProps: object; // 默认属性
}>;

function withTmpPath(opts: {
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


export default (api: IApi) => {
  api.describe({
    key: "modify-default-props",
    config: {
      schema({zod}) {
        return zod.union([zod.literal(true), zod.object({
          defaultTabs: zod.array(zod.union([zod.string(),zod.object({
            key: zod.string(),
            closeable: zod.boolean().optional()
          })])).optional(),
          closeable: zod.boolean().optional(),
          showWhenEmptyTabs: zod.boolean().optional(),
          className: zod.string().optional(),
          theme: zod.string().optional(),
          widthType: zod.union([zod.literal('fit-content'),zod.object({
            type: zod.union([zod.literal('maxWidth'),zod.literal('width')]),
            width: zod.number()
          })]).optional(),
          rightMenu: zod.boolean().optional(),
          reloadIcon: zod.boolean().optional(),
          overflowCount: zod.number().optional(),
          remarkMaxLength: zod.number().optional(),
        })]);
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });
  api.addExtraBabelPlugins(()=>withTmpPath({api, path: "babel"}));
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: "babel.js",
      tplPath: join(__dirname, "babel.js"),
      context: {},
    });
  });
};
