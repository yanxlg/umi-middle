/*
 * @Author: yanxlg
 * @Date: 2023-05-24 15:24:35
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-24 23:10:12
 * @Description: 三方包 alias 自动检测
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { IApi } from "umi";

export default (api: IApi) => {
  api.describe({
    key: "entries",
    config: {
      schema({zod}) {
        return zod.map(zod.string(),zod.string()).optional();
      },
    },
    enableBy: api.EnableBy.config,
  });
  
  api.chainWebpack(( memo) => {
    const entryMap = api.config.entries;
    Object.keys(entryMap).forEach((name)=>{
      memo.entry(name).add(entryMap[name]);
    });
  });
  
  const compileMap: {[name: string]: string[]} = {}; // 查找对应的entry文件。
  
  api.modifyHTML(($) => {
    $('body script:first').prepend([`window.__middle_entry_map__=${JSON.stringify(compileMap)}`]);
    return $;
  })
  api.onBuildComplete(({stats})=>{
    const fileList = Object.keys(stats.compilation.assets);// 所有文件列表
    const entryMap = api.config.entries;
    Object.keys(entryMap).forEach(name=>{
      compileMap[name]= fileList.filter(file=> file.split('.')[0] === name);
    });
  });
};
