/*
 * @Author: yanxlg
 * @Date: 2023-10-24 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-30 15:06:06
 * @Description: 辉创接入插件 
 *
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { join } from "path";
import { IApi } from "umi";

const isProduction = process.env.NODE_ENV === "production";

export default async (api: IApi) => {
  api.describe({
    key: "hc",
    config: {
      schema({ zod }) {
        return zod.boolean();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config, // 配置时生效
  });
  
  const appName = require(`${api.paths.cwd}/package.json`).name; // 组件中注册的name
  const publicPath = `/app/${appName}/static/`;
  // 修改项目配置
  api.modifyConfig((memo, { paths }) => {
    // 辉创默认开启微前端，通知修改publicPath
    if(!appName){
      throw new Error('辉创应用需要配置对应的应用code，请在项目package.json中通过name字段配置');
    }
   
    if(memo.publicPath && memo.publicPath !== publicPath){
      console.warn(`配置中已经自定义了公共路径，检测发现与项目应用编码生成的辉创路径不一致，请检查并确保其正确，publicPath值应为：${publicPath}`);
    }
    memo.publicPath = memo.publicPath || publicPath;
    memo.runtimePublicPath = {};
    memo.qiankun = {
      ...memo.qiankun,
      slave: {
        ...memo.qiankun?.slave,
        shouldNotModifyRuntimePublicPath: true,
      },
    }
    return memo;
  })
  
  api.addEntryCodeAhead(() => `window.publicPath = "${publicPath}"`); // 公共路径
  
  // runtime 修改
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: "useMenu.ts",
      tplPath: join(__dirname, "useMenu.ts.tpl"),
      context: {},
    });
    api.writeTmpFile({
      path: "usePermissions.ts",
      tplPath: join(__dirname, "usePermissions.ts.tpl"),
      context: {},
    });
  });
};
