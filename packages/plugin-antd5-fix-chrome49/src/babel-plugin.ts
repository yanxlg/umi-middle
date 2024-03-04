import type babelCore from "@babel/core";
import {join} from "path";

type VisitorState = {
  file: {
    opts: babelCore.TransformOptions;
  };
  filename: string;
};


const ReplaceComponents = ['Space'];

function addAliasImport(
  path: babelCore.NodePath,
  t: typeof babelCore.types,
  importName: string,
  aliaName: string
) {
  const programPath = path.findParent(
    (path2) => path2.isProgram()
  ) as unknown as babelCore.NodePath<babelCore.types.Program>;
  ;
  if (programPath) {
    const importDefault = t.importSpecifier(
      t.identifier(aliaName),
      t.identifier(importName)
    );
    const imports = t.importDeclaration(
      [importDefault],
      t.stringLiteral(join(__dirname, importName))
    );
    programPath.node.body.splice(0, 0, imports);
  }
}

export default function FixChrome49InAntd5(babel: typeof babelCore): babelCore.PluginObj<VisitorState> {
  let t = babel.types;
  return {
    visitor: {
      ImportDeclaration(path, state) {
        if (state.filename.indexOf(__dirname) > -1) {
          return;
        }
        // 到入的语句
        const programPath = path.findParent(
          (path2) => path2.isProgram()
        ) as unknown as babelCore.NodePath<babelCore.types.Program>;
        const importAlias: Array<{
          origin: string;
          alia: string;
        }> = [];
        if (programPath) {
          programPath.node.body.forEach((node, nodeIndex) => {
            if (t.isImportDeclaration(node)) {
              const specifiers = node.specifiers;
              if (specifiers && t.isStringLiteral(node.source, {
                type: "StringLiteral",
                value: "antd"
              })) {
                specifiers.forEach((specifier, importIndex) => {
                  if (t.isImportSpecifier(specifier)) {
                    const local = specifier.local;
                    const imported = specifier.imported as babelCore.types.Identifier;
                    if (local && imported.type === "Identifier" && ReplaceComponents.indexOf(imported.name) > -1) {
                      importAlias.push({
                        origin: imported.name,
                        alia: local.name
                      });
                      node.specifiers.splice(importIndex, 1);
                      if (t.isImportDeclaration(node) && node.specifiers.length === 0) {
                        programPath.node.body.splice(nodeIndex, 1);
                      }
                    }
                  }
                })
              }
            }
          })

          // 遍历插入
          if (importAlias.length) {
            importAlias.forEach(({origin, alia}) => {
              console.log(`组件【${origin}】被替换：${state.filename.replace(process.cwd(), '')} ==> ${join(__dirname, origin)}`);
              addAliasImport(path, t, origin, alia);
            })
          }
        }
      }
    }
  };
}
