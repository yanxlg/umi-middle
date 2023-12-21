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
import fs from 'fs';
import path from 'path';
import { winPath } from "umi/plugin-utils";

function join(...pathList:string[]){
  return winPath(path.join(...pathList));
}

export default (api: IApi) => {
  api.describe({
    key: "auto-alias",
    enableBy: api.EnableBy.register,
  });

  api.modifyConfig((memo)=>{
    // art-template 自动适配
    if(fs.existsSync(join(api.paths.absNodeModulesPath,'art-template'))){
      memo.alias = {
        'art-template': require.resolve('art-template/lib/template-web.js'),
        ...memo.alias||{},
      }
    }
    return memo;
  });
};
