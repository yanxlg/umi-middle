/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-06 10:57:29
 * @Description:
 * 检查是不是存在view.tsx|view.jsx 如果支持，表示组件在编辑器中和。view.js 支持。  __editMode 属性。如果有的话原属性直接传过来，不处理（editable、children等）。
 * meta.json | meta.ts | meta.tsx  支持default导出，支持 meta 属性导出。
 *
 * 拆分包。渲染态、编辑态。渲染态数据精简。只需要
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
// 读取本地目录，生成对应的入口文件。 index.ts 是不是也可以不需要了？？？或者
import * as fs from "fs";
import * as path from "path";
import { cwd } from "process";
import { IApi } from "umi";
import { Mustache, winPath } from "umi/plugin-utils";

export function withTmpPath(opts: {
  api: IApi;
  path: string;
  noPluginDir?: boolean;
}) {
  return winPath(
    path.join(
      opts.api.paths.absTmpPath,
      opts.api.plugin.key && !opts.noPluginDir
        ? `plugin-${opts.api.plugin.key}`
        : "",
      opts.path
    )
  );
}

function toCamelCase(str: string): string {
  // 转驼峰
  return str
    .replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/\.(\w)/g, (_, c) => (c ? `.${c.toUpperCase()}` : ""))
    .replace(/^\w/, (_) => (_ ? _.toUpperCase() : ""));
}

function getEditFile(dir: string) {
  const files = ["edit.tsx", "edit.jsx", "edit.js"];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const editComponentFile = path.join(dir, file);
    if (fs.existsSync(editComponentFile)) {
      return editComponentFile;
    }
  }
  return undefined;
}

function getMainFile(dir: string) {
  const files = ["index.tsx", "index.jsx", "index.js"];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const editComponentFile = path.join(dir, file);
    if (fs.existsSync(editComponentFile)) {
      return editComponentFile;
    }
  }
  return undefined;
}

function getMetaFile(dir: string) {
  const files = ["meta.json", "meta.tsx", "meta.ts", "meta.jsx", "meta.js"];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const metaFile = path.join(dir, file);
    if (fs.existsSync(metaFile)) {
      // 存在文件
      return metaFile;
    }
  }
  return undefined;
}

export const pluginKey = "asset";

export default (api: IApi) => {
  api.describe({
    key: pluginKey,
    config: {
      schema({ zod }) {
        return zod.boolean();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles, // 发生变化之后重新生成文件
    },
    enableBy: api.EnableBy.register,
  });

  const cwdPath = cwd();
  const componentsDir = path.join(cwdPath, "components");

  function generateComponentFile(
    componentsDir: string,
    components: string[],
    hasEditView: boolean,
    parentDir?: string // 父目录名，如果需要拼接的话内部需要拼接成真实的组件名
  ) {
    const componentDirs = fs.readdirSync(componentsDir);
    componentDirs.forEach((dir) => {
      const dirPath = path.join(componentsDir, dir);
      const isDirectory = fs.statSync(dirPath).isDirectory();
      if (isDirectory) {
        const componentFile = getMainFile(dirPath);
        const schemaFile = getMetaFile(dirPath);
        if (componentFile && schemaFile) {
          const componentName = toCamelCase(
            parentDir ? `${parentDir}-${dir}` : dir
          );
          components.push(componentName);
          api.writeTmpFile({
            path: `components/${componentName}.tsx`,
            content: `
import ${componentName} from '${componentFile}';
import schema from '${schemaFile}';

${componentName}.__meta__ = schema;
export default ${componentName};
            `,
          });

          if (hasEditView) {
            // 是不是有
            const editFile = getEditFile(dirPath);
            const _componentFile = editFile || componentFile;
            api.writeTmpFile({
              path: `edit/${componentName}.tsx`,
              content: `
  import ${componentName} from '${_componentFile}';
  import schema from '${schemaFile}';
  
  ${componentName}.__meta__ = schema;
  ${editFile ? `${componentName}.__designMode__ = true;` : ""}
  export default ${componentName};
              `,
            });
          }
        }

        // 对于子文件夹，自动进行关联处理。
        fs.readdirSync(dirPath).forEach((subPath) => {
          const fullPath = path.join(dirPath, subPath);
          if (fs.statSync(fullPath).isDirectory()) {
            // 存在子文件夹
            const _parentDir = parentDir ? `${parentDir}-${subPath}` : subPath;
            generateComponentFile(dirPath, components, hasEditView, _parentDir);
          }
        });
      }
    });
  }

  api.onGenerateFiles(() => {
    // 遍历 components 目录，生成对应的入口。
    // const componentDirs = fs.readdirSync(componentsDir);
    const components: string[] = [];

    // // 检测是否有edit.tsx文件存在，如果有，需要生成不同的文件
    // let hasEditView = componentDirs.find((dir) => {
    //   const dirPath = path.join(componentsDir, dir);
    //   const isDirectory = fs.statSync(dirPath).isDirectory();
    //   if (isDirectory) {
    //     const editComponentFile = getEditFile(dirPath);
    //     if (editComponentFile) {
    //       return true;
    //     }
    //   }
    //   return false;
    // });

    // 强制生成edit和view两个不同的文件，view中需要对meta对象属性进行剔除，保留必要属性，减少包体积。
    const hasEditView = true;

    generateComponentFile(componentsDir, components, hasEditView);
    //     componentDirs.forEach((dir) => {
    //       const dirPath = path.join(componentsDir, dir);
    //       const isDirectory = fs.statSync(dirPath).isDirectory();
    //       if (isDirectory) {
    //         const componentFile = getMainFile(dirPath);
    //         const schemaFile = getMetaFile(dirPath);
    //         if (componentFile && schemaFile) {
    //           const componentName = toCamelCase(dir);
    //           components.push(componentName);
    //           api.writeTmpFile({
    //             path: `components/${componentName}.tsx`,
    //             content: `
    // import ${componentName} from '${componentFile}';
    // import schema from '${schemaFile}';

    // ${componentName}.__meta__ = schema;
    // export default ${componentName};
    //             `,
    //           });

    //           if (hasEditView) {
    //             // 是不是有
    //             const editFile = getEditFile(dirPath);
    //             const _componentFile = editFile || componentFile;
    //             api.writeTmpFile({
    //               path: `edit/${componentName}.tsx`,
    //               content: `
    //   import ${componentName} from '${_componentFile}';
    //   import schema from '${schemaFile}';

    //   ${componentName}.__meta__ = schema;
    //   ${editFile ? `${componentName}.__designMode__ = true;` : ""}
    //   export default ${componentName};
    //               `,
    //             });
    //           }
    //         }

    //         // 对于子文件夹，自动进行关联处理。

    //         const extraFIles = fs.readdirSync(dirPath).filter((subPath) => {
    //           const fullPath = path.join(dirPath, subPath);
    //           if (fs.statSync(dirPath).isDirectory()) {
    //             // 存在子文件夹
    //           }
    //         });
    //       }
    //     });

    api.writeTmpFile({
      path: `view.tsx`,
      content: `
${components
  .map((component) => `import ${component} from './components/${component}';`)
  .join("\n")}
export { ${components.join(", ")} };
      `,
    });

    if (hasEditView) {
      api.writeTmpFile({
        path: `edit.tsx`,
        content: `
  ${components
    .map((component) => `import ${component} from './edit/${component}';`)
    .join("\n")}
export { ${components.join(", ")} };
        `,
      });
    }

    // 读取项目package.json
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(cwd(), "package.json"), "utf-8")
    );

    // 支持项目自定义.babelrc
    const customBabelRcFile = path.join(cwd(), ".babelrc");
    let babelPresets = undefined;
    let babelPlugins = undefined;
    if (fs.existsSync(customBabelRcFile)) {
      try {
        const configJson = JSON.parse(
          fs.readFileSync(customBabelRcFile, "utf-8")
        );
        babelPresets = configJson.presets
          ?.map((_: string | object) => JSON.stringify(_, null, 2))
          ?.join(",");
        babelPlugins = configJson.plugins
          ?.map((_: string | object) => JSON.stringify(_, null, 2))
          ?.join(",");
      } catch (e) {}
    }

    api.writeTmpFile({
      path: `.fatherrc.ts`,
      content: Mustache.render(
        fs.readFileSync(path.join(__dirname, "fatherrc.ts.tpl"), "utf-8"),
        {
          hasEditView,
          pluginKey: api.plugin.key,
          output: path.join(cwdPath, "dist", packageJson.version), // 修改为项目根目录
          babelPresets,
          babelPlugins,
        }
      ),
    });
  });
};
