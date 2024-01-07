/*
 * @author: yanxianliang
 * @date: 2024-01-07 11:03
 * @desc: 解析静态属性
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */

import * as parser from "@babel/parser";
import {ExportDefaultDeclaration, ExpressionStatement, Identifier, FunctionDeclaration} from "@babel/types";

export function getConfigPropertiesFromSource(content: string, file: string, properties: string[]) {
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
      /\.tsx?/.test(file) ? 'typescript' : 'flow'
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

  const declaration = exportDefaultDeclaration.declaration;
  const exportDefaultName = (declaration as Identifier)?.name || (declaration as FunctionDeclaration)?.id?.name;
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
        if (left.type === 'MemberExpression' && left.object && (left.object as Identifier).name === exportDefaultName && (left.property as Identifier).name === property && (right.type === 'StringLiteral' || right.type === 'BooleanLiteral' || right.type === 'NumericLiteral')) {
          propertyValues[property] = right.value;
        }
      }
    });
  });

  return propertyValues;
}
