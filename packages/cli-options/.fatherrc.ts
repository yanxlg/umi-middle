import { defineConfig } from "father";
export default defineConfig({
  cjs: {
    transformer: "babel",
    output: 'cjs'
  },
  esm: {
    transformer: "babel",
    output: 'esm'
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
  ],
});
