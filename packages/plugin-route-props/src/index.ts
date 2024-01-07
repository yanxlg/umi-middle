/*
 * @Author: yanxlg
 * @Date: 2023-04-27 11:38:53
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-19 10:41:11
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {IApi} from "umi";
import {getConfigPropertiesFromSource} from '@middle-cli/utils';

export default (api: IApi) => {
  api.describe({
    key: "extendRouteProps",
    config: {
      schema({zod}) {
        return zod.array(zod.string());
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyRoutes((memo) => {
    const fields = api.config.extendRouteProps;
    Object.keys(memo).forEach((id) => {
      const route = memo[id];
      const content = route.__content;// 内容
      if (content) { // 解析内容
        const properties = getConfigPropertiesFromSource(content, route.file,fields);
        Object.assign(route,properties);
      }
    });
    return memo;
  })
};
