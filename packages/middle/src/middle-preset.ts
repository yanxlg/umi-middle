/*
 * @Author: yanxlg
 * @Date: 2023-05-04 22:43:43
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-05 21:58:04
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
export default () => {
  return {
    plugins: [
      require.resolve("@middle/plugin-watermark"),
      require.resolve("@middle/plugin-tabs"),
    ],
  };
};
