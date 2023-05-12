import { defineConfig } from "father";

export default defineConfig({
  umd: {
    entry: {
      "view": {
        externals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@middle/runner": "Runner", // 从umi 导出了部分值。比如history，编译会报错，后面修改，或者外部处理
          lodash: "Lodash",
          "react-router": "ReactRouter",
          "react-router-dom": "ReactRouterDom",
          "@designable/core": "DesignableCore",
          "@designable/react-sandbox": "DesignableReactSandbox",
          "@designable/react-settings-form": "DesignableReactSettingsForm",
          "@designable/react": "DesignableReact",
          "@designable/setters": "DesignableSetters",
          "@designable/shared": "DesignableShared",
          "@designable/transformer": "DesignableTransformer",
          "@formily/react": "FormilyReact",
          "@formily/reactive": "FormilyReactive",
          "@formily/reactive-react": "FormilyReactiveReact",
          "@middle/request": "MiddleRequest"
        },
        postcssOptions: undefined,
        name: "{{{name}}}", // 导出的全局变量名
      },
      {{#hasEditView}}
      "edit": {
        externals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@middle/runner": "Runner", // 从umi 导出了部分值。比如history，编译会报错，后面修改，或者外部处理
          lodash: "Lodash",
          "react-router": "ReactRouter",
          "react-router-dom": "ReactRouterDom",
          "@designable/core": "DesignableCore",
          "@designable/react-sandbox": "DesignableReactSandbox",
          "@designable/react-settings-form": "DesignableReactSettingsForm",
          "@designable/react": "DesignableReact",
          "@designable/setters": "DesignableSetters",
          "@designable/shared": "DesignableShared",
          "@designable/transformer": "DesignableTransformer",
          "@formily/react": "FormilyReact",
          "@formily/reactive": "FormilyReactive",
          "@formily/reactive-react": "FormilyReactiveReact",
          "@middle/request": "MiddleRequest", // 目前需要在系统中配置代理自动转发，因此需要从请求库中添加拦截器处理
        },
        postcssOptions: undefined,
        name: "{{{name}}}", // 导出的全局变量名
      },
      {{/hasEditView}}
    },
    postcssOptions: undefined,
    output: "{{{output}}}",
  },
  extraBabelPlugins: [
    [
      "babel-plugin-import",
      {
        libraryName: "antd",
        libraryDirectory: "es",
        style: true,
      },
      "antd",
    ],
    [
      "babel-plugin-import",
      {
        libraryName: "@middle/ui",
        libraryDirectory: "es",
        style: false,
      },
      "middle-ui",
    ],
    [
      "babel-plugin-import",
      {
        libraryName: "@ant-design/icons",
        camel2DashComponentName: true,
        customName: (name: string, file: object) => {
          const camelName = name.replace(/-(\w)/g, function (all, letter) {
            return letter.toUpperCase();
          });
          if ("createFromIconfontCN" === camelName) {
            return `@ant-design/icons/lib/components/IconFont`;
          }
          return `@ant-design/icons/lib/icons/${camelName[0].toUpperCase()}${camelName.substring(
            1
          )}`;
        },
      },
      "@ant-design/icons",
    ],
    {{{babelPlugins}}}
  ],
  {{#babelPresets}}
  extraBabelPresets: [{{{babelPresets}}}]
  {{/babelPresets}}
});
