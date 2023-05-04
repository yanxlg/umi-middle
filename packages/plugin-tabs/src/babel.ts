/**
 * React.createContext 转换成reactivation.createContext
 */
import type babelCore from "@babel/core";

type VisitorState = {
  file: {
    opts: babelCore.TransformOptions;
  };
  filename: string;
};

function addAliasImport(
  path: babelCore.NodePath,
  t: typeof babelCore.types,
  importName?: string
) {
  const programPath = path.findParent((path) =>
    path.isProgram()
  ) as unknown as babelCore.NodePath<babelCore.types.Program>;
  const aliasName = importName || "createContext";
  const hasImport =
    programPath &&
    programPath.node.body.find((node) => {
      // 页面上所有node节点
      if (t.isImportDeclaration(node)) {
        const specifiers = node.specifiers;
        return (
          specifiers &&
          t.isStringLiteral(node.source, {
            type: "StringLiteral",
            value: "react-activation",
          }) &&
          specifiers.find((specifier) => {
            if (t.isImportSpecifier(specifier)) {
              const local = specifier.local;
              const imported = specifier.imported;
              return (
                local &&
                imported.type === "Identifier" &&
                imported.name === "createContext" &&
                local.type === "Identifier" &&
                local.name === aliasName
              );
            }
            return false;
          })
        );
      }
      return false;
    });
  if (!hasImport) {
    const importDefault = t.importSpecifier(
      t.identifier(aliasName),
      t.identifier("createContext")
    );
    const imports = t.importDeclaration(
      [importDefault],
      t.stringLiteral("react-activation")
    );
    programPath.node.body.splice(0, 0, imports); // 导入依赖组件
  }
}

export default function wrapKeepAlivePlugin(
  babel: typeof babelCore
): babelCore.PluginObj<VisitorState> {
  let t = babel.types;
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const programPath = path.findParent((path) =>
          path.isProgram()
        ) as unknown as babelCore.NodePath<babelCore.types.Program>;

        /**
         * 场景一
         * import { createContext } from 'react';
         *
         * createContext()
         **/

        let importCreateContextFromReact = false;
        let aliasName = undefined;
        if (programPath) {
          const nodeIndex = programPath.node.body.findIndex((node) => {
            if (t.isImportDeclaration(node)) {
              // 页面上所有node节点
              const specifiers = node.specifiers;
              if (
                specifiers &&
                t.isStringLiteral(node.source, {
                  type: "StringLiteral",
                  value: "react",
                })
              ) {
                const importIndex = specifiers.findIndex((specifier) => {
                  if (t.isImportSpecifier(specifier)) {
                    const local = specifier.local;
                    const imported = specifier.imported || local;
                    return (
                      local &&
                      imported.type === "Identifier" &&
                      imported.name === "createContext"
                    );
                  }
                  return false;
                });
                // aliasName
                if (importIndex > -1) {
                  aliasName = specifiers[importIndex].local.name;
                  node.specifiers.splice(importIndex, 1);
                  return true;
                }
                return false;
              }
            }
            return false;
          });
          if (nodeIndex > -1) {
            importCreateContextFromReact = true;
            const node = programPath.node.body[nodeIndex];
            if (t.isImportDeclaration(node) && node.specifiers.length === 0) {
              // 删除该节点
              programPath.node.body.splice(nodeIndex, 1);
            }
          }
        }

        if (importCreateContextFromReact) {
          addAliasImport(path, t, aliasName);
        }

        /**
         * 场景二
         * import * as React from 'react';
         *
         * React.createContext
         **/
        // 查找 defaultImport from react
        if (programPath) {
          programPath.node.body.forEach((node) => {
            // 页面上所有node节点
            if (t.isImportDeclaration(node)) {
              const specifiers = node.specifiers;
              if (
                specifiers &&
                t.isStringLiteral(node.source, {
                  type: "StringLiteral",
                  value: "react",
                })
              ) {
                specifiers.forEach((specifier) => {
                  const isDefaultImport = t.isImportDefaultSpecifier(specifier); // import default
                  const isNameSpaceImport =
                    t.isImportNamespaceSpecifier(specifier);
                  if (isDefaultImport || isNameSpaceImport) {
                    // 插入 import {createContext} from 'react-activation';
                    addAliasImport(path, t, undefined); // addImport
                    const globalName = specifier.local.name;
                    // 全局 函数名需要替换
                    programPath.traverse({
                      MemberExpression(path) {
                        // 找到位置
                        const node = path.node;
                        const object = node.object;
                        const property = node.property;
                        if (
                          object &&
                          property &&
                          object.type === "Identifier" &&
                          object.name === globalName &&
                          property.type === "Identifier" &&
                          property.name === "createContext"
                        ) {
                          // 修改
                          const funcId = t.identifier("createContext");
                          path.replaceWith(funcId); // 修改引用
                        }
                      },
                    });
                  }
                });
              }
            }
          });
        }
      },
    },
  };
}
