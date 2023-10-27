/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-20 11:11:04
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
import { winPath } from "umi/plugin-utils";

const MonacoEditorWebpackPlugin = require("monaco-editor-webpack-plugin");

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

function removeSymbol(str: string): string {
  return str.replace(/\@/g, "").replace(/\//g, "-");
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

export const pluginKey = "material";

export default (api: IApi) => {
  api.describe({
    key: pluginKey,
    config: {
      schema({ zod }) {
        return zod.boolean();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles, // 发生变化之后重新生成文件
    },
    enableBy: api.EnableBy.config,
  });

  const cwdPath = cwd();
  const componentsDir = path.join(cwdPath, "components");

  function generateSubComponentFile(
    componentDir: string,
    dir: string,
    components: string[],
    hasEditView: boolean,
    parentDir?: string
  ) {
    const dirPath = path.join(componentDir, dir);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      const componentFile = getMainFile(dirPath);
      const schemaFile = getMetaFile(dirPath);
      if (componentFile && schemaFile) {
        const componentName = toCamelCase(
          parentDir ? `${parentDir}-${dir}` : dir
        );
        // 目标组件路径需要存在层级关系。
        components.push(toCamelCase(parentDir ? `${parentDir}.${dir}` : dir));
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
          const _parentDir = parentDir ? `${parentDir}-${dir}` : dir; // 重复了，包括所有的
          generateSubComponentFile(
            dirPath,
            subPath,
            components,
            hasEditView,
            _parentDir
          );
        }
      });
    }
  }

  function generateComponentFile(
    componentsDir: string,
    components: string[],
    hasEditView: boolean
  ) {
    const componentDirs = fs.readdirSync(componentsDir);
    componentDirs.forEach((dir) => {
      generateSubComponentFile(componentsDir, dir, components, hasEditView);
    });
  }

  api.onGenerateFiles(() => {
    // 遍历 components 目录，生成对应的入口。
    // const componentDirs = fs.readdirSync(componentsDir);
    const components: string[] = [];

    // 强制生成edit和view两个不同的文件，view中需要对meta对象属性进行剔除，保留必要属性，减少包体积。
    const hasEditView = true;

    generateComponentFile(componentsDir, components, hasEditView);

    // 源码生成
    const viewImports: string[] = [];
    const viewWidgets: Array<Array<string>> = [];

    components.forEach((component) => {
      const validName = component.replace(/\./g, "");
      viewImports.push(`import ${validName} from './components/${validName}';`);
      viewWidgets.push([component, validName]);
    });

    api.writeTmpFile({
      path: `view.tsx`,
      content: `
${viewImports.join("\n")}
const widgets = {
${viewWidgets
  .map(([key, value]) => {
    return `"${key}": ${value}`;
  })
  .join(",")}
};
export default widgets;
      `,
    });

    if (hasEditView) {
      const editImports: string[] = [];
      const editWidgets: Array<Array<string>> = [];
      components.forEach((component) => {
        const validName = component.replace(/\./g, "");
        editImports.push(`import ${validName} from './edit/${validName}';`);
        editWidgets.push([component, validName]);
      });

      api.writeTmpFile({
        path: `edit.tsx`,
        content: `
${editImports.join("\n")}
const widgets = {
${editWidgets
  .map(([key, value]) => {
    return `"${key}": ${value}`;
  })
  .join(",")}
};
export default widgets;
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
    const libraryName = toCamelCase(removeSymbol(packageJson.name));
    api.writeTmpFile({
      path: `.fatherrc.ts`,
      tplPath: path.join(__dirname, "fatherrc.ts.tpl"),
      context: {
        hasEditView,
        pluginKey: api.plugin.key,
        output: path.join(cwdPath, "umd"), // 修改为项目根目录
        // output: path.join(cwdPath, "dist", packageJson.version), // 修改为项目根目录
        babelPresets,
        babelPlugins,
        name: libraryName,
        historyAlias: withTmpPath({ api, path: "history.ts" }),
      },
    });

    api.writeTmpFile({
      path: `history.ts`,
      content: "export const history = undefined;",
    });

    api.writeTmpFile({
      path: "index.ts",
      content: `export const assetPackageName = "${libraryName}"`,
    });

    const devPlugin = api.isPluginEnable("asset-dev");
    if (devPlugin) {
      // 生成asset.json文件
      // 读取当前已经存在的json文件
      const destPath = path.join(cwdPath, "src/asset.json");//
      // 需要点的
      // 组合修改json
      if (fs.existsSync(destPath)) {
        try {
          const assetJson = JSON.parse(fs.readFileSync(destPath, "utf-8"));
          assetJson.packages = [
            {
              name: packageJson.name,
              library: libraryName,
              version: packageJson.version,
            },
          ];
          assetJson.components = assetJson.components || [];
          assetJson.components.forEach((component:any)=>{
            component.npm.version = packageJson.version;
          });
          assetJson.components = assetJson.components.filter((component:any)=>{
            return components.indexOf(component.name) > -1;
          });

          components.forEach((name) => {
            if (
              assetJson.components &&
              Array.isArray(assetJson.components) &&
              assetJson.components.find((_: any) => _.name === name)
            ) {
              return;
            }
            assetJson.components = assetJson.components || [];
            assetJson.components.push({
              name: name,
              npm: {
                package: packageJson.name,
                version: packageJson.version,
              },
              group: "调试物料",
              category: "",
            });
          });

          fs.writeFileSync(destPath, JSON.stringify(assetJson, null, 2));
        } catch (e) {}
      } else {
        const initJson = {
          version: "1.0.0",
          packages: [
            {
              name: packageJson.name,
              library: libraryName,
              version: packageJson.version,
            },
          ],
          components: components.map((_) => {
            return {
              name: _,
              npm: {
                package: packageJson.name,
                version: packageJson.version,
              },
              group: "调试物料",
              category: "",
            };
          }),
          sort: [
            {
              group: "调试物料",
              categories: [""],
            },
          ],
        };
        fs.writeFileSync(destPath, JSON.stringify(initJson, null, 2));
      }
    }
  });


  api.modifyConfig((memo, { paths }) => {
    // 地址
    memo.routes = [
      {
        path: "/",
        component: require.resolve("@meditor/designer/es/devtools/index.js"),
      },
    ];
    memo.alias = {
      ...memo.alias,
      'antd/es/locale/en_US.js': 'antd/es/locale/zh_CN.js',
      'antd/es/locale/default.js': 'antd/es/locale/zh_CN.js',
      'antd/lib/locale/en_US.js': 'antd/es/locale/zh_CN.js',
      'antd/lib/locale/default.js': 'antd/es/locale/zh_CN.js',
    }
    return memo;
  });

  api.chainWebpack((memo, { webpack, env }) => {
    memo
      .entry("sandbox")
      .add(require.resolve("@meditor/designer/es/devtools/sandbox/index.js")); // sandbox 配置不同的externals
    memo
      .plugin("MonacoEditorWebpackPlugin")
      .use(MonacoEditorWebpackPlugin, [
        { languages: ["css", "javascript", "typescript", "json", "less"] },
        ]);
  });
};
