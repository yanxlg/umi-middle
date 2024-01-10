/*
 * @Author: yanxlg
 * @Date: 2023-10-24 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-30 15:06:06
 * @Description: 辉创接入插件
 * 全局Layout自动集成
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {join} from "path";
import {IApi} from "umi";
import {winPath} from "umi/plugin-utils";
import fs from 'fs';
import {withTmpPath, checkDependence} from '@middle-cli/utils';
import {resolveLayout} from './layout';

const tmpDir = winPath(join(__dirname, "..", "template"));

export default async (api: IApi) => {
  api.describe({
    key: "hc",
    config: {
      schema({zod}) {
        return zod.object({
          layout: zod.union([zod.boolean(), zod.literal("antd@4"), zod.literal("antd@5"), zod.literal("yh-design")]) // 支持layout自动集成
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config, // 配置时生效
  });

  api.addRuntimePlugin({
    fn: () => withTmpPath({api, path: "runtime.tsx"}),
    stage: Number.MAX_SAFE_INTEGER,
  });

  const {useAntd, antdVersion, useYhDesign, buildWithNginx} = checkDependence();

  // 修改项目配置
  api.modifyConfig((memo, {paths}) => {
    // 部署在辉创网关nginx下
    if (buildWithNginx) {
      const appName = require(`${api.paths.cwd}/package.json`).name; // 组件中注册的name
      const publicPath = `/app/${appName}/static/`;

      // 辉创默认开启微前端，通知修改publicPath
      if (!appName) {
        throw new Error('辉创应用需要配置对应的应用code，请在项目package.json中通过name字段配置');
      }

      if (memo.publicPath && memo.publicPath !== publicPath) {
        console.warn(`配置中已经自定义了公共路径，检测发现与项目应用编码生成的辉创路径不一致，请检查并确保其正确，publicPath值应为：${publicPath}`);
      }
      memo.publicPath = memo.publicPath || publicPath;
      memo.runtimePublicPath = {};
      memo.headScripts = [...memo.headScripts || [], `window.publicPath = "${publicPath}"`];
    }

    memo.qiankun = {
      ...memo.qiankun,
      slave: {
        ...memo.qiankun?.slave,
        ...buildWithNginx ? {shouldNotModifyRuntimePublicPath: true,} : {},
      },
    }
    memo.hash = memo.hash === void 0 ? true : memo.hash;

    // qiankun插件需要手动来强制开启
    process.env.INITIAL_QIANKUN_SLAVE_OPTIONS = process.env.INITIAL_QIANKUN_SLAVE_OPTIONS || "{}"; // 强制开启slave插件
    if (memo.qiankun.master) {
      process.env.INITIAL_QIANKUN_MASTER_OPTIONS = process.env.INITIAL_QIANKUN_MASTER_OPTIONS || "{}"; // 强制开启master插件
    }
    return memo;
  })


  // runtime 修改
  api.onGenerateFiles(() => {

    const withGlobalResponseInterceptor = fs.existsSync(join(api.paths.absSrcPath, 'interceptors', 'response.interceptor.tsx')) ||
      fs.existsSync(join(api.paths.absSrcPath, 'interceptors', 'response.interceptor.ts')) ||
      fs.existsSync(join(api.paths.absSrcPath, 'interceptors', 'response.interceptor.js'));

    api.writeTmpFile({
      path: "useMenu.ts",
      tplPath: join(tmpDir, "useMenu.ts.tpl"),
      context: {
        withGlobalResponseInterceptor: withGlobalResponseInterceptor
      },
    });
    api.writeTmpFile({
      path: "index.ts",
      tplPath: join(tmpDir, "index.ts.tpl"),
      context: {},
    });
    api.writeTmpFile({
      path: "usePermissions.ts",
      tplPath: join(tmpDir, "usePermissions.ts.tpl"),
      context: {},
    });

    api.writeTmpFile({
      path: "fetchPermissions.ts",
      tplPath: join(tmpDir, "fetchPermissions.ts.tpl"),
      context: {
        withGlobalResponseInterceptor: withGlobalResponseInterceptor
      },
    });
    api.writeTmpFile({
      path: "permissionsRef.ts",
      tplPath: join(tmpDir, "permissionsRef.ts.tpl"),
      context: {},
    });

    if (useAntd) {
      api.writeTmpFile({
        path: "403.tsx",
        tplPath: join(tmpDir, "403.antd.tsx.tpl"),
        context: {},
      });
    }
    if (useYhDesign) {
      api.writeTmpFile({
        path: "403.tsx",
        tplPath: join(tmpDir, "403.yh-design.tsx.tpl"),
        context: {},
      });
    }

    // 自定义的403 检测
    const withCustom403 = fs.existsSync(join(api.paths.absSrcPath, 'pages', '403.tsx')) ||
      fs.existsSync(join(api.paths.absSrcPath, 'pages', '403.js')) ||
      fs.existsSync(join(api.paths.absSrcPath, 'pages', '403.jsx'));

    // 403 页面路径
    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(tmpDir, "runtime.tsx.tpl"),
      context: {
        page403: withCustom403 ? '@/pages/403' : withTmpPath({api, path: '403.tsx'}),
      },
    });
    // 调用html-css-property 插件，添加变量。 大小只能在umi 配置中设置，需要直接生成到html中，组件中创建会
  });

  // 辉创布局生成
  resolveLayout(api);
};
