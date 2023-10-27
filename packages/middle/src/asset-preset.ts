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
      require.resolve("@middle-cli/plugin-material"),
      require.resolve("@middle-cli/plugin-history-inject"),
      require.resolve("@middle-cli/plugin-body-scripts"),
      require.resolve("@middle-cli/plugin-alias"),
      require.resolve("@middle-cli/plugin-umd"),
      require.resolve("@middle-cli/plugin-entries")
    ],
  };
};
