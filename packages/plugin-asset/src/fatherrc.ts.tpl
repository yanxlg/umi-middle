import { defineConfig } from "father";

export default defineConfig({
  alias: {
    "@@/core/history": "{{{historyAlias}}}"
  },
  umd: {
    entry: {
      "view": {
        externals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@middle/runner": "Runner", // 从umi 导出了部分值。比如history，编译会报错，后面修改，或者外部处理
          lodash: "_",
          "react-router": "ReactRouter",
          "react-router-dom": "ReactRouterDOM",
          "dayjs": "dayjs",
          "moment": "dayjs", // moment强制转换成dayjs
          "@meditor/core": {
            amd: '@meditor/core',
            commonjs: '@meditor/core',
            commonjs2: '@meditor/core',
            root: ['MEditor', 'Core']
          },
          "@meditor/react": {
            amd: '@meditor/react',
            commonjs: '@meditor/react',
            commonjs2: '@meditor/react',
            root: ['MEditor', 'React']
          },
          "@meditor/setters": {
            amd: '@meditor/setters',
            commonjs: '@meditor/setters',
            commonjs2: '@meditor/setters',
            root: ['MEditor', 'Setters']
          },
          "@meditor/shared": {
            amd: '@meditor/shared',
            commonjs: '@meditor/shared',
            commonjs2: '@meditor/shared',
            root: ['MEditor', 'Shared']
          },
          "@meditor/transformer": {
            amd: '@meditor/transformer',
            commonjs: '@meditor/transformer',
            commonjs2: '@meditor/transformer',
            root: ['MEditor', 'Transformer']
          },
          "@formily/react": {
            amd: '@formily/react',
            commonjs: '@formily/react',
            commonjs2: '@formily/react',
            root: ['Formily', 'React']
          },
          "@formily/reactive": {
            amd: '@formily/reactive',
            commonjs: '@formily/reactive',
            commonjs2: '@formily/reactive',
            root: ['Formily', 'Reactive']
          },
          "@formily/reactive-react": {
            amd: '@formily/reactive-react',
            commonjs: '@formily/reactive-react',
            commonjs2: '@formily/reactive-react',
            root: ['Formily', 'ReactiveReact']
          },
          "@middle/request": "MiddleRequest", // 目前需要在系统中配置代理自动转发，因此需要从请求库中添加拦截器处理
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
          lodash: "_",
          "react-router": "ReactRouter",
          "react-router-dom": "ReactRouterDOM",
          "dayjs": "dayjs",
          "moment": "dayjs", // moment强制转换成dayjs
          "@meditor/core": {
            amd: '@meditor/core',
            commonjs: '@meditor/core',
            commonjs2: '@meditor/core',
            root: ['MEditor', 'Core']
          },
          "@meditor/react": {
            amd: '@meditor/react',
            commonjs: '@meditor/react',
            commonjs2: '@meditor/react',
            root: ['MEditor', 'React']
          },
          "@meditor/setters": {
            amd: '@meditor/setters',
            commonjs: '@meditor/setters',
            commonjs2: '@meditor/setters',
            root: ['MEditor', 'Setters']
          },
          "@meditor/shared": {
            amd: '@meditor/shared',
            commonjs: '@meditor/shared',
            commonjs2: '@meditor/shared',
            root: ['MEditor', 'Shared']
          },
          "@meditor/transformer": {
            amd: '@meditor/transformer',
            commonjs: '@meditor/transformer',
            commonjs2: '@meditor/transformer',
            root: ['MEditor', 'Transformer']
          },
          "@formily/react": {
            amd: '@formily/react',
            commonjs: '@formily/react',
            commonjs2: '@formily/react',
            root: ['Formily', 'React']
          },
          "@formily/reactive": {
            amd: '@formily/reactive',
            commonjs: '@formily/reactive',
            commonjs2: '@formily/reactive',
            root: ['Formily', 'Reactive']
          },
          "@formily/reactive-react": {
            amd: '@formily/reactive-react',
            commonjs: '@formily/reactive-react',
            commonjs2: '@formily/reactive-react',
            root: ['Formily', 'ReactiveReact']
          },
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
    ["babel-plugin-replace-imports",
      {
        "test": /\/locale\/en_US/i,
        "replacer": "/locale/zh_CN"
      },
      "locale-replace-imports"
    ],
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
