/*
 * @Author: yanxlg
 * @Date: 2023-05-05 21:57:54
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-18 23:14:58
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
export default () => {
  return {
    plugins: [
      require.resolve("@middle-cli/plugin-asset"),
      require.resolve("@middle-cli/plugin-asset-dev"),
      require.resolve("@middle-cli/plugin-history-inject"),
      require.resolve("@middle-cli/plugin-body-scripts")
    ],
  };
};
