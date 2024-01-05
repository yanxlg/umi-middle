/*
 * @Author: yanxlg
 * @Date: 2023-05-24 15:24:35
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-24 23:10:12
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { IApi } from "umi";
import {getConfigPropertiesFromSource} from "@middle-cli/plugin-tabs";

export default (api: IApi) => {
  api.describe({
    key: "default-config",
    enableBy: api.EnableBy.register,
  });

  api.modifyConfig((memo) => {
    // 将title 传递到运行时中
    memo.conventionRoutes = memo.conventionRoutes ?? {
      exclude: [
        /\/components\//,
        /\/models\//,
        /\/services\//,
        /\/configs\//,
        /\/utils\//,
        /\/hooks\//,
        /\/redux-slices\//,
        /README\.md/i,
        /\.d\.ts$/,
      ],
    };
    if (memo.title) {
      memo.define = {
        "process.env.Title": memo.title,
        ...memo.define
      };
    }
    return memo;
  })

  api.modifyRoutes((memo) => {
    Object.keys(memo).forEach((id) => {
      const route = memo[id];
      const content = route.__content;// 内容
      if (content) { // 解析内容
        const properties = getConfigPropertiesFromSource(content, route.file,['title']);
        Object.assign(route,properties);
      }
    });
    return memo;
  })
};
