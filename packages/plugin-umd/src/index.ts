/*
 * @Author: yanxlg
 * @Date: 2023-05-24 15:24:35
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-24 23:10:12
 * @Description: 三方包 alias 自动检测
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { IApi, terminal } from "umi";
import fs from 'fs';
import path from 'path';
import { winPath } from "umi/plugin-utils";

function join(...pathList: string[]){
  return winPath(path.join(...pathList));
}

const isProduction = process.env.NODE_ENV === "production";

function getUmdFilePath(api: IApi, pkg: string, fileName: string){
  // lodash 特殊处理
  if(pkg === 'lodash'){
    return isProduction? `node_modules/${pkg}/lodash.min.js`: `node_modules/${pkg}/lodash.js`;
  }

  return isProduction?
              fs.existsSync(join(api.paths.absNodeModulesPath,pkg,'umd',`${fileName}.production.min.js`))? `node_modules/${pkg}/umd/${fileName}.production.min.js`:
              fs.existsSync(join(api.paths.absNodeModulesPath,pkg,'umd',`${fileName}.production.js`))? `node_modules/${pkg}/umd/${fileName}.production.js`:
              fs.existsSync(join(api.paths.absNodeModulesPath,pkg,'umd',`${fileName}.min.js`)) ? `node_modules/${pkg}/umd/${fileName}.min.js`:
              fs.existsSync(join(api.paths.absNodeModulesPath,pkg,'umd',`${fileName}.js`)) ? `node_modules/${pkg}/umd/${fileName}.js`:'':
              fs.existsSync(join(api.paths.absNodeModulesPath,pkg,'umd',`${fileName}.development.min.js`))? `node_modules/${pkg}/umd/${fileName}.development.min.js`:
              fs.existsSync(join(api.paths.absNodeModulesPath,pkg,'umd',`${fileName}.development.js`))? `node_modules/${pkg}/umd/${fileName}.development.js`:
              fs.existsSync(join(api.paths.absNodeModulesPath,pkg,'umd',`${fileName}.min.js`)) ? `node_modules/${pkg}/umd/${fileName}.min.js`:
              fs.existsSync(join(api.paths.absNodeModulesPath,pkg,'umd',`${fileName}.js`)) ? `node_modules/${pkg}/umd/${fileName}.js`:'';
}


export default (api: IApi) => {
  api.describe({
    key: "umd",
    config: {
      schema({zod}) {
        return zod.array(zod.union([
          zod.string(),
          zod.object({
            pkg: zod.string(),
            files: zod.array(zod.string()),
          })
        ])).optional(); // 需要导入的umd包，支持本地和cdn。cdn自动插入到headScripts中。
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyConfig((memo)=>{
    const umd = memo.umd;
    memo.copy = memo.copy||[];
    memo.headScripts = memo.headScripts || [];
    const outPath = memo.outputPath || 'dist';
    if(umd && Array.isArray(umd) && umd.length > 0){
      // 修改copy 及 headScripts
      umd.forEach(library=>{
        if(library){
          if(typeof library === 'string'){
            if(/http|https|\/\//.test(library)){
              memo.headScripts.push(library);
            }else{
              // local 模块. 检测文件
              const exportsVersion = require(`${library}/package.json`).version;
              const umdFilePath = getUmdFilePath(api,library,library);
              if(!umdFilePath){
                terminal.warn(`找不到${library}对应的umd文件，请确认目录格式是否规范`);
              }else{
                memo.copy.push({
                  from: umdFilePath,
                  to: join(outPath,`${library}@${exportsVersion}${isProduction?'.min':''}.js`)
                });
                memo.headScripts.push(`/${library}@${exportsVersion}${isProduction?'.min':''}.js`)
              }
            }
          }else{
            if(typeof library === 'object' && library.pkg && library.files){
              const {pkg: name, files} = library;// 额外导入模块文件
              if(Array.isArray(files) && files.length >0){
                const exportsVersion = require(`${name}/package.json`).version;
                files.forEach((file)=>{
                  const umdFilePath = getUmdFilePath(api,name,file);
                  if(!umdFilePath){
                    terminal.warn(`找不到包${name}中${file}对应的umd文件，请确认目录格式是否规范`);
                  }else{
                    memo.copy.push({
                      from: umdFilePath,
                      to: join(outPath,`${file}@${exportsVersion}${isProduction?'.min':''}.js`)
                    });
                    memo.headScripts.push(`/${file}@${exportsVersion}${isProduction?'.min':''}.js`)
                  }
                });
              }
            }
          }
        }
      });
    }
    return memo;
  });
};
