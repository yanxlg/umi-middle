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
import {winPath} from "umi/plugin-utils";
import {getConfigPropertiesFromSource, checkDependence} from '@middle-cli/utils';

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

const tmpDir = winPath(join(__dirname, "..", "template")); // 模版目录

export default (api: IApi) => {
  api.describe({
    key: "tabs",
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
        })]);
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  api.addRuntimePluginKey(() => ["tabs"]);

  api.addRuntimePlugin({
    fn: () => "@@/plugin-tabs/runtime",
    stage: -1 * Number.MAX_SAFE_INTEGER,
  }); // 因 keep-alive 的 runtime 部分选择不渲染其 children，可能会丢失默认的用户 rootContainer，因此第一个注册，作为最深 Container

  api.addExtraBabelPresets(()=>withTmpPath({api, path: "babel-preset"}))
  // 约定式路由需要从代码中解析相关配置
  api.modifyRoutes((memo) => {
    Object.keys(memo).forEach((id) => {
      const route = memo[id];
      const content = route.__content;// 内容
      if (content) { // 解析内容
        const properties = getConfigPropertiesFromSource(content, route.file,['title', 'tabTemplate', 'tabMode', 'saveScrollPosition', 'tabKey']);
        Object.assign(route,properties);
      }
    });
    return memo;
  })

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      tplPath: join(tmpDir, "runtimeConfig.d.ts"),
      context: {}
    });

    // 支持import { KeepAlive } from 'umi';
    api.writeTmpFile({
      path: "index.tsx",
      tplPath: join(tmpDir, "index.tsx.tpl"),
      context: {},
    });

    api.writeTmpFile({
      path: "babel-preset.js",
      tplPath: join(__dirname, "babel-preset.tpl.js"),
      context: {},
    });

    api.writeTmpFile({
      path: "babel.js",
      tplPath: join(__dirname, "babel.js"),
      context: {},
    });

    api.writeTmpFile({
      path: "KeepAliveWrapper.tsx",
      tplPath: join(tmpDir, "KeepAliveWrapper.tsx.tpl"),
      context: {},
    });

    const reactExternal = api.config.externals?.react; // umd 加载React
    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(tmpDir, "runtime.tsx.tpl"),
      context: {
        reactExternal: reactExternal,
      },
    });

    // windowTabs 组件生成
    const config = api.config;
    // 可能
    const prefixCls = config.antd?.configProvider?.prefixCls;
    const themePrefixCls = config.theme?.['@ant-prefix'];
    // 获取配置的antd样式前缀
    const antdPrefix = prefixCls || themePrefixCls || "ant";
    const { useYhDesign} = checkDependence();

    const tabsConfig = config.tabs === true?{}:config.tabs;


    // 配置
    api.writeTmpFile({
      path: "WindowTabs/index.tsx",
      tplPath: join(tmpDir, "WindowTabs/index.tsx.tpl"),
      context: {
        antdPrefix,
        useYhDesign,
        defaultConfig: JSON.stringify(tabsConfig)
      },
    });
    const base = api.config.base || "/";
    api.writeTmpFile({
      path: "WindowTabs/useTabs.ts",
      tplPath: join(tmpDir, "WindowTabs/useTabs.ts.tpl"),
      context: {
        base,
      },
    });

    api.writeTmpFile({
      path: "WindowTabs/themes/otb/index.less",
      tplPath: join(tmpDir, "WindowTabs/themes/otb/index.less.tpl"),
      context: {
        antdPrefix,
      },
    });
  });
};
