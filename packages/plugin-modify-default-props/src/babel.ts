/**
 * 给React 组件添加默认defaultProps属性。
 */
import type babelCore from "@babel/core";

type VisitorState = {
  file: {
    opts: babelCore.TransformOptions;
  };
  filename: string;
};

type ModifyType = Array<{
  match: string | RegExp;
  identifier: string; // 组件变量名
  defaultProps: { [key: string]: boolean | string | number | unknown }; // 默认属性
}>;

export default function modifyDefaultPropsPlugin(
  babel: typeof babelCore,
  options: {
    modifies: ModifyType
  }
): babelCore.PluginObj<VisitorState> {
  const types = babel.types;
  const {modifies} = options;
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const filePath = state.filename;
        const findModifyType = modifies.find(modify => {
          return new RegExp(modify.match).test(filePath);
        });
        if (!findModifyType) {
          return;
        }
        const {identifier, defaultProps} = findModifyType;

        const programPath = path.findParent((path) =>
          path.isProgram()
        ) as unknown as babelCore.NodePath<babelCore.types.Program>;

        const body = programPath.node.body;

        const hasDefaultProps = body.find(node =>
          types.isExpressionStatement(node) &&
          types.isAssignmentExpression(node.expression) &&
          types.isMemberExpression(node.expression.left) &&
          types.isIdentifier(node.expression.left.object) &&
          types.isIdentifier(node.expression.left.property) &&
          node.expression.left.object.name === identifier &&
          node.expression.left.property.name === 'defaultProps'
        ); // 已经存在初始化了
        if (!hasDefaultProps) {
          // 不存在则创建初始化节点
          const node = types.expressionStatement(
            types.assignmentExpression(
              '=',
              types.memberExpression(
                types.identifier(identifier),
                types.identifier('defaultProps')
              ),
              types.logicalExpression(
                "||",
                types.memberExpression(
                  types.identifier(identifier),
                  types.identifier('defaultProps')
                ),
                types.objectExpression([])
              )
            )
          )
          body.push(node);
        }

        Object.keys(defaultProps).forEach(key => {
          const value = defaultProps[key];
          // 查找是否存在 key - value节点。不存在则添加
          if (!body.find(node =>
            types.isExpressionStatement(node) &&
            types.isAssignmentExpression(node.expression) &&
            types.isMemberExpression(node.expression.left) &&
            types.isMemberExpression(node.expression.left.object) &&
            types.isIdentifier(node.expression.left.object.object) &&
            types.isIdentifier(node.expression.left.object.property) &&
            types.isIdentifier(node.expression.left.property) &&
            node.expression.left.object.object.name === identifier &&
            node.expression.left.object.property.name === 'defaultProps' &&
            node.expression.left.property.name === key &&
            types.isLiteral(node.expression.right) &&
            (value === null && types.isNullLiteral(node.expression.right) ||
              (types.isStringLiteral(node.expression.right) || types.isBooleanLiteral(node.expression.right) || types.isNumericLiteral(node.expression.right)) && node.expression.right.value === value
            )
          )) {
            const isValidType = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null;
            if (isValidType) {
              // 插入
              const node = types.expressionStatement(
                types.assignmentExpression(
                  '=',
                  types.memberExpression(
                    types.memberExpression(
                      types.identifier(identifier),
                      types.identifier('defaultProps')
                    ),
                    types.identifier(key)
                  ),
                  typeof value === 'string' ?
                    types.stringLiteral(value) :
                    typeof value === 'number' ?
                      types.numericLiteral(value) :
                      typeof value === 'boolean' ?
                        types.booleanLiteral(value) : types.nullLiteral()
                )
              )
              body.push(node);
            }
          }
        })
      },
    },
  };
}
