/*
 * @Author: yanxlg
 * @Date: 2023-04-27 11:38:53
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-29 12:32:36
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import * as fs from "fs";
import { join } from "path";
import { IApi } from "umi";
import { Mustache, winPath } from "umi/plugin-utils";

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

export default (api: IApi) => {
  // See https://umijs.org/docs/guides/plugins
  // hooks 生成
  // useActive
  // useUnActive 需要用到菜单数据，与routes数据

  api.describe({
    key: "tabs",
    config: {
      schema({ zod }) {
        return zod.boolean().optional();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  api.addRuntimePlugin({
    fn: () => "@@/plugin-tabs/runtime",
    stage: -1 * Number.MAX_SAFE_INTEGER,
  }); // 因 keep-alive 的 runtime 部分选择不渲染其 children，可能会丢失默认的用户 rootContainer，因此第一个注册，作为最深 Container

  // Babel Plugin for react-activation
  api.addExtraBabelPlugins(() => require.resolve("react-activation/babel"));

  api.addExtraBabelPlugins(() => withTmpPath({ api, path: "babel" }));

  api.onGenerateFiles(() => {
    // 支持import { KeepAlive } from 'umi';
    api.writeTmpFile({
      path: "index.tsx",
      content: Mustache.render(
        fs.readFileSync(join(__dirname, "index.tsx.tpl"), "utf-8"),
        {}
      ),
    });

    api.writeTmpFile({
      path: "babel.js",
      content: Mustache.render(
        fs.readFileSync(join(__dirname, "babel.js"), "utf-8"),
        {}
      ),
    });
    api.writeTmpFile({
      path: "babel.d.ts",
      content: Mustache.render(
        fs.readFileSync(join(__dirname, "babel.d.ts"), "utf-8"),
        {}
      ),
    });

    api.writeTmpFile({
      path: "KeepAliveWrapper.tsx",
      content: Mustache.render(
        fs.readFileSync(join(__dirname, "KeepAliveWrapper.tsx.tpl"), "utf-8"),
        {}
      ),
    });

    const reactExternal = api.config.externals?.react; // umd 加载React
    api.writeTmpFile({
      path: "runtime.tsx",
      content: Mustache.render(
        fs.readFileSync(join(__dirname, "runtime.tsx.tpl"), "utf-8"),
        {
          reactExternal: reactExternal,
        }
      ),
    });

    // windowTabs 组件生成

    // 获取配置的antd样式前缀
    const antdPrefix = api.config.antd?.configProvider?.prefixCls || "ant";
    // 配置
    api.writeTmpFile({
      path: "WindowTabs/index.tsx",
      content: Mustache.render(
        fs.readFileSync(join(__dirname, "WindowTabs/index.tsx.tpl"), "utf-8"),
        {
          antdPrefix,
        }
      ),
    });
    const base = api.config.base || "/";
    api.writeTmpFile({
      path: "WindowTabs/useTabs.ts",
      content: Mustache.render(
        fs.readFileSync(join(__dirname, "WindowTabs/useTabs.ts.tpl"), "utf-8"),
        {
          base,
        }
      ),
    });

    api.writeTmpFile({
      path: "WindowTabs/themes/otb/index.less",
      content: Mustache.render(
        fs.readFileSync(
          join(__dirname, "WindowTabs/themes/otb/index.less.tpl"),
          "utf-8"
        ),
        {
          antdPrefix,
        }
      ),
    });
  });
};
