/*
 * @Author: yanxlg
 * @Date: 2023-05-24 15:24:35
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-24 20:42:27
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { IApi } from "umi";

export default (api: IApi) => {
  api.describe({
    key: "default-config",
    enableBy: api.EnableBy.register,
  });

  api.onGenerateFiles(() => {
    api.modifyDefaultConfig((memo) => {
      memo.conventionRoutes = memo.conventionRoutes ?? {
        exclude: [
          /\/components\//,
          /\/models\//,
          /\/services\//,
          /\/redux-slices\//,
          /README.md/i,
        ],
      };
      return memo;
    });
  });
};
