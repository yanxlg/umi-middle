/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-30 15:06:06
 * @Description: 根节点样式变量维护
 *
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { join } from "path";
import { IApi } from "umi";

export default async (api: IApi) => {
  api.describe({
    key: "htmlCssProperties",
    config: {
      schema({ zod }) {
        return zod.record(zod.string(), zod.union([zod.string(), zod.number()]));
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  const config = api.config;
  const cssProperties = config.htmlCssProperties;

  api.modifyHTML(($, { path }) => {
    const root = $('html');
    const style = root.attr('style');
    const properties = Object.keys(cssProperties).map(key=>`${key}: ${cssProperties[key]}`);
    const append = properties.join('; ');
    if(style && style.indexOf(append) > -1){
      return $;
    }
    const nextStyle = style?[style,append].join('; '): append;
    root.attr('style', nextStyle);
    return $;
  })

  // runtime 修改
  api.onGenerateFiles(() => {
    const htmlCssProperties = api.config.htmlCssProperties || {}; // 默认值
    const indexPath = join(__dirname, "index.ts.tpl");
    const keys = Object.keys(htmlCssProperties);

    const propertyType:{[key: string]: string} = {};
    keys.forEach(key=>{
      propertyType[key] = typeof htmlCssProperties[key];
    });

    api.writeTmpFile({
      path: "index.ts",
      tplPath: indexPath,
      context: {
        type: `{${keys.map(key=>`'${key}': ${propertyType[key]}`).join('; ')}`,
      },
    });
  });
};
