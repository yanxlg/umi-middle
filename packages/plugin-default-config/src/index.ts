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
import {getConfigPropertiesFromSource} from '@middle-cli/utils';
import {join} from "path";

export default (api: IApi) => {
  api.describe({
    key: "default-config",
    enableBy: api.EnableBy.register,
  });

  api.addRuntimePlugin({
    fn: () => "@@/plugin-default-config/runtime",
    stage: -1 * Number.MAX_SAFE_INTEGER,
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

    const useYhDesign = (()=>{
      try {
        require.resolve('@yh/yh-design');
        return true
      }catch (e){
        return false
      }
    })();

    if(useYhDesign && !memo.extraBabelPlugins?.find((plugin: any)=>Array.isArray(plugin) && plugin[2] === '@yh/yh-design')){
      memo.extraBabelPlugins = [
        ...memo.extraBabelPlugins||[],
        ['import', {
          libraryName: '@yh/yh-design',
          libraryDirectory: 'es',
          camel2DashComponentName: false,
          style: true
        },'@yh/yh-design']
      ];
    }
    memo.extraBabelPlugins = [
      ...memo.extraBabelPlugins||[],
      ['import', {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },'lodash']
    ];
    memo.define = {
      'process.env.NODE_ENV' : process.env.NODE_ENV,
      ...memo.define||{},
    }
    return memo;
  })

  api.modifyRoutes((memo) => {
    Object.keys(memo).forEach((id) => {
      const route = memo[id];
      const content = route.__content;// 内容
      if (content) { // 解析内容
        const properties = getConfigPropertiesFromSource(content, route.file,['title', 'permission','layout','login']);
        Object.assign(route,properties);
      }
    });
    return memo;
  })

  api.onGenerateFiles(() => {
    const config = api.config;
    // 可能
    const prefixCls = config.antd?.configProvider?.prefixCls;
    const themePrefixCls = config.theme?.['@ant-prefix'];

    api.writeTmpFile({
      path: "index.tsx",
      tplPath: join(__dirname, "index.tsx.tpl"),
      context: {
        antdPrefix: prefixCls || themePrefixCls || 'ant',
        title: config.title
      },
    });

    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(__dirname, "runtime.tsx.tpl"),
      context: {
      },
    });
  })
};
