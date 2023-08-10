/*
 * @Author: yanxlg
 * @Date: 2023-04-27 11:38:53
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-19 10:41:11
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {join} from "path";
import {IApi} from "umi";
import {winPath} from "umi/plugin-utils";
import parser from '@babel/parser';
import {ExportDefaultDeclaration, ExpressionStatement, Identifier} from "@babel/types";

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


function getConfigPropertiesFromSource(content: string, properties: string[]) {
  const ast = parser.parse(content, {
    sourceType: 'module',
    allowImportExportEverywhere: false,
    allowReturnOutsideFunction: false,
    createParenthesizedExpressions: false,
    ranges: false,
    tokens: false,
    plugins: [
      'decorators',
      'decoratorAutoAccessors',
      'doExpressions',
      'exportDefaultFrom',
      'flow',
      'functionBind',
      'importAssertions',
      'jsx',
      'regexpUnicodeSets',
    ],
    // decoratorOptions: { version: "2022-03", decoratorsBeforeExport: false, allowCallParenthesized: true },
    // pipelineOptions: { proposal: 'hack', hackTopicToken: '%' },
    // typescriptOptions: { dts: false, disallowAmbiguousJSXLike: false },
  });
  const program = ast.program;
  const body = program.body;
  const exportDefaultDeclaration = body.find(statement => statement.type === 'ExportDefaultDeclaration') as ExportDefaultDeclaration;
  if (!exportDefaultDeclaration) {
    return undefined;
  }

  const exportDefaultName = (exportDefaultDeclaration.declaration as Identifier)?.name;
  if (!exportDefaultName) {
    return undefined;
  }

  const expressionStatementList = body.filter(statement => statement.type === 'ExpressionStatement') as ExpressionStatement[];
  if (!expressionStatementList || expressionStatementList.length === 0) {
    return undefined;
  }

  const propertyValues: { [key: string]: string } = {};

  properties.forEach(property => {
    expressionStatementList.forEach(statement => {
      const expression = statement.expression;
      if (expression.type === 'AssignmentExpression') {
        const left = expression.left;
        const right = expression.right;
        if (left.type === 'MemberExpression' && left.object && (left.object as Identifier).name === exportDefaultName && (left.property as Identifier).name === property && right.type === 'StringLiteral') {
          propertyValues[property] = right.value;
        }
      }
    });
  });

  return propertyValues;
}


export default (api: IApi) => {
  // See https://umijs.org/docs/guides/plugins
  // hooks 生成
  // useActive
  // useUnActive 需要用到菜单数据，与routes数据

  api.describe({
    key: "tabs",
    config: {
      schema({zod}) {
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

  api.addExtraBabelPlugins(() => withTmpPath({api, path: "babel"}));

  // 约定式路由需要从代码中解析相关配置
  api.modifyRoutes((memo) => {
    Object.keys(memo).forEach((id) => {
      const route = memo[id];
      const content = route.__content;// 内容
      if (content) { // 解析内容
        const properties = getConfigPropertiesFromSource(content, ['tabTemplate', 'tabMode', 'saveScrollPosition']);
        Object.assign(route,properties);
      }
    });
    return memo;
  })

  api.onGenerateFiles(() => {
    // 支持import { KeepAlive } from 'umi';
    api.writeTmpFile({
      path: "index.tsx",
      tplPath: join(__dirname, "index.tsx.tpl"),
      context: {},
    });

    api.writeTmpFile({
      path: "babel.js",
      tplPath: join(__dirname, "babel.js"),
      context: {},
    });

    api.writeTmpFile({
      path: "KeepAliveWrapper.tsx",
      tplPath: join(__dirname, "KeepAliveWrapper.tsx.tpl"),
      context: {},
    });

    const reactExternal = api.config.externals?.react; // umd 加载React
    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(__dirname, "runtime.tsx.tpl"),
      context: {
        reactExternal: reactExternal,
      },
    });

    // windowTabs 组件生成

    // 获取配置的antd样式前缀
    const antdPrefix = api.config.antd?.configProvider?.prefixCls || "ant";
    // 配置
    api.writeTmpFile({
      path: "WindowTabs/index.tsx",
      tplPath: join(__dirname, "WindowTabs/index.tsx.tpl"),
      context: {
        antdPrefix,
      },
    });
    const base = api.config.base || "/";
    api.writeTmpFile({
      path: "WindowTabs/useTabs.ts",
      tplPath: join(__dirname, "WindowTabs/useTabs.ts.tpl"),
      context: {
        base,
      },
    });

    api.writeTmpFile({
      path: "WindowTabs/themes/otb/index.less",
      tplPath: join(__dirname, "WindowTabs/themes/otb/index.less.tpl"),
      context: {
        antdPrefix,
      },
    });
  });
};
