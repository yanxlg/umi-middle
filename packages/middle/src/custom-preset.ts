/*
 * @Author: yanxlg
 * @Date: 2023-05-04 22:43:43
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-24 20:43:06
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
export default () => {
  return {
    plugins: [
      require.resolve("@middle-cli/plugin-watermark"),
      require.resolve("@middle-cli/plugin-tabs"),
      require.resolve("@middle-cli/plugin-dva-ts"),
      require.resolve("@middle-cli/plugin-default-config"),
      require.resolve("@middle-cli/plugin-sentry"),
      require.resolve("@middle-cli/plugin-release-check"),
      require.resolve("@middle-cli/plugin-inject-env"),
      require.resolve("@middle-cli/plugin-click-to-component"),
      require.resolve("@middle-cli/plugin-sauron"),
      require.resolve("@middle-cli/plugin-history-inject"),
      require.resolve("@middle-cli/plugin-body-scripts"),
      require.resolve("@middle-cli/plugin-hc"),
      require.resolve("@middle-cli/plugin-route-props"),
      require.resolve("@middle-cli/plugin-alias"),
      require.resolve("@middle-cli/plugin-umd"),
      require.resolve("@middle-cli/plugin-entries"),
      require.resolve("@middle-cli/plugin-material"),
      require.resolve("@middle-cli/plugin-html-css-property"),
      require.resolve("@middle-cli/plugin-antd5-fix-chrome49"),
      require.resolve("@middle-cli/plugin-modify-default-props")
    ],
  };
};
