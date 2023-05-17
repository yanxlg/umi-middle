import { defineConfig } from "father";
// const webpack = require('webpack');

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
          "react-router-dom": "ReactRouterDOM",
          "dayjs": "dayjs",
          "@designable/core": {
            amd: '@designable/core',
            commonjs: '@designable/core',
            commonjs2: '@designable/core',
            root: ['Designable', 'Core']
          },
          "@designable/react": {
            amd: '@designable/react',
            commonjs: '@designable/react',
            commonjs2: '@designable/react',
            root: ['Designable', 'React']
          },
          "@designable/setters": {
            amd: '@designable/setters',
            commonjs: '@designable/setters',
            commonjs2: '@designable/setters',
            root: ['Designable', 'Setters']
          },
          "@designable/shared": {
            amd: '@designable/shared',
            commonjs: '@designable/shared',
            commonjs2: '@designable/shared',
            root: ['Designable', 'Shared']
          },
          "@designable/transformer": {
            amd: '@designable/transformer',
            commonjs: '@designable/transformer',
            commonjs2: '@designable/transformer',
            root: ['Designable', 'Transformer']
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
          lodash: "Lodash",
          "react-router": "ReactRouter",
          "react-router-dom": "ReactRouterDOM",
          "dayjs": "dayjs",
          "@designable/core": {
            amd: '@designable/core',
            commonjs: '@designable/core',
            commonjs2: '@designable/core',
            root: ['Designable', 'Core']
          },
          "@designable/react": {
            amd: '@designable/react',
            commonjs: '@designable/react',
            commonjs2: '@designable/react',
            root: ['Designable', 'React']
          },
          "@designable/setters": {
            amd: '@designable/setters',
            commonjs: '@designable/setters',
            commonjs2: '@designable/setters',
            root: ['Designable', 'Setters']
          },
          "@designable/shared": {
            amd: '@designable/shared',
            commonjs: '@designable/shared',
            commonjs2: '@designable/shared',
            root: ['Designable', 'Shared']
          },
          "@designable/transformer": {
            amd: '@designable/transformer',
            commonjs: '@designable/transformer',
            commonjs2: '@designable/transformer',
            root: ['Designable', 'Transformer']
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
    // chainWebpack:(mero)=>{
    //   mero.plugin('AntLocaleReplacementPlugin').use(webpack.NormalModuleReplacementPlugin,[/\/(es|lib)\/(locale|locale-provider)\/(en_US|default)\.js/,function(resource){
    //     resource.request = resource.request.replace('en_US','zh_CN').replace('default','zh_CN');
    //     // console.log(resource.request); // 所有的语言包都替换调
    //   }]);
    //   return mero;
    // },
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
