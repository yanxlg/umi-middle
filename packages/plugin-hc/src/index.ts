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
import { winPath } from "umi/plugin-utils";
import fs from 'fs';

function withTmpPath(opts: {
  api: IApi;
  path: string;
  noPluginDir?: boolean;
}) {
  return winPath(
    join(
      opts.api.paths.absTmpPath,
      opts.api.plugin.key && !opts.noPluginDir
        ? `plugin-${opts.api.plugin.key}`
        : "",
      opts.path
      )
      );
}


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

  api.addRuntimePlugin({
    fn: () => "@@/plugin-hc/runtime",
    stage: Number.MAX_SAFE_INTEGER,
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
    memo.hash = memo.hash === void 0 ? true:memo.hash;
    memo.headScripts = [...memo.headScripts||[], `window.publicPath = "${publicPath}"`];
    return memo;
  })


  // runtime 修改
  api.onGenerateFiles(() => {

    const withGlobalResponseInterceptor = fs.existsSync(join(api.paths.absSrcPath,'interceptors','response.interceptor.tsx')) ||
      fs.existsSync(join(api.paths.absSrcPath,'interceptors','response.interceptor.ts')) ||
      fs.existsSync(join(api.paths.absSrcPath,'interceptors','response.interceptor.js'));

    api.writeTmpFile({
      path: "useMenu.ts",
      tplPath: join(__dirname, "useMenu.ts.tpl"),
      context: {
        withGlobalResponseInterceptor: withGlobalResponseInterceptor
      },
    });
    api.writeTmpFile({
      path: "index.ts",
      tplPath: join(__dirname, "index.ts.tpl"),
      context: {},
    });
    api.writeTmpFile({
      path: "usePermissions.ts",
      tplPath: join(__dirname, "usePermissions.ts.tpl"),
      context: {},
    });

    api.writeTmpFile({
      path: "fetchPermissions.ts",
      tplPath: join(__dirname, "fetchPermissions.ts.tpl"),
      context: {
        withGlobalResponseInterceptor: withGlobalResponseInterceptor
      },
    });
    api.writeTmpFile({
      path: "permissionsRef.ts",
      tplPath: join(__dirname, "permissionsRef.ts.tpl"),
      context: {},
    });
    // 默认403页面生成
    const useAntd = (()=>{
      try {
        require.resolve('antd');
        return true
      }catch (e){
        return false
      }
    })();

    const useYhDesign = (()=>{
      try {
        require.resolve('@yh/yh-design');
        return true
      }catch (e){
        return false
      }
    })();

    if(useAntd){
      api.writeTmpFile({
        path: "403.tsx",
        tplPath: join(__dirname, "403.antd.tsx.tpl"),
        context: {},
      });
    }
    if(useYhDesign){
      api.writeTmpFile({
        path: "403.tsx",
        tplPath: join(__dirname, "403.yh-design.tsx.tpl"),
        context: {},
      });
    }

    // 自定义的403 检测
    const withCustom403 = fs.existsSync(join(api.paths.absSrcPath,'pages','403.tsx')) ||
      fs.existsSync(join(api.paths.absSrcPath,'pages','403.js')) ||
      fs.existsSync(join(api.paths.absSrcPath,'pages','403.jsx'));


    // 403 页面路径
    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(__dirname, "runtime.tsx.tpl"),
      context: {
        page403: withCustom403?'@/pages/403':withTmpPath({api, path: '403.tsx'}),
      },
    });
  });
};
