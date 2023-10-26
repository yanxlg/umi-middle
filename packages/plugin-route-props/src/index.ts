/*
 * @Author: yanxlg
 * @Date: 2023-04-27 11:38:53
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-19 10:41:11
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {IApi} from "umi";
import * as parser from '@babel/parser';
import {ExportDefaultDeclaration, ExpressionStatement, Identifier} from "@babel/types";
function getConfigPropertiesFromSource(content: string,file: string, properties: string[]) {
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
      'functionBind',
      'importAssertions',
      'jsx',
      'regexpUnicodeSets',
      /\.tsx?/.test(file)?'typescript':'flow'
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
  api.describe({
    key: "routeProps",
    config: {
      schema({zod}) {
        return zod.array(zod.string()).optional();
      },
    },
    enableBy: api.EnableBy.register,
  });
 
  api.modifyRoutes((memo) => {
    const fields = api.config.routeProps||['layout','login'];
    Object.keys(memo).forEach((id) => {
      const route = memo[id];
      const content = route.__content;// 内容
      if (content) { // 解析内容
        const properties = getConfigPropertiesFromSource(content, route.file,fields);
        Object.assign(route,properties);
      }
    });
    return memo;
  })
};
