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
import fs from "fs";

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

function copyDirectory(baseTemplateDir: string, api: IApi, context: object, directoryPath?: string) {
  // 读取指定路径下的所有文件和子目录
  const directory = join(baseTemplateDir, directoryPath||'');
  const filesAndDirectories = fs.readdirSync(directory);
  for (let i = 0; i < filesAndDirectories.length; i++) {
    const fileOrDirName = filesAndDirectories[i];
    const itemPath = join(directory, fileOrDirName);
    if (fs.statSync(itemPath).isFile()) {
      if(/\.tpl$/.test(fileOrDirName)){
        api.writeTmpFile({
          path: join(directoryPath||'', fileOrDirName).replace(/\.tpl$/,''),
          tplPath: itemPath,
          context: context
        })
      }else{
        api.writeTmpFile({
          path: join(directoryPath||'', fileOrDirName), // 生成目录文件
          content: fs.readFileSync(itemPath, "utf-8")
        });
      }
    } else if (fs.statSync(itemPath).isDirectory()) {
      copyDirectory(baseTemplateDir, api, context, join(directoryPath||'', fileOrDirName));
    }
  }
}

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
          remarkMaxLength: zod.number().optional(),
          remarkEllipsisType: zod.union([zod.literal('middle'), zod.literal('start'), zod.literal('end')]).optional(),
          remarkShowEllipsis: zod.boolean().optional(),
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
        const properties = getConfigPropertiesFromSource(content, route.file!,['title', 'tabTemplate', 'tabMode', 'saveScrollPosition', 'tabKey', 'tabReplaceKey']);
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


    const base = api.config.base || "/";
    // copy 所有文件
    copyDirectory(tmpDir, api, {
      antdPrefix,
      useYhDesign,
      defaultConfig: JSON.stringify(tabsConfig),
      base,
    },'WindowTabs');
  });
};
