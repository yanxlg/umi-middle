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
import {IApi, RUNTIME_TYPE_FILE_NAME} from "umi";
import {winPath} from "umi/plugin-utils";
import fs from 'fs';
import path from 'path';
import {withTmpPath} from '@middle-cli/utils';

const tmpDir = winPath(join(__dirname, "..", "template"));

function writeDirectory(templateDir: string, directoryPath: string, api: IApi) {
  // 读取指定路径下的所有文件和子目录
  const filesAndDirectories = fs.readdirSync(directoryPath);
  for (let i = 0; i < filesAndDirectories.length; i++) {
    const fileOrDirName = filesAndDirectories[i];
    const itemPath = path.join(directoryPath, fileOrDirName);
    if (fs.statSync(itemPath).isFile()) {
      api.writeTmpFile({
        path: itemPath.replace(templateDir, 'layout'), // 生成目录文件
        content: fs.readFileSync(itemPath, "utf-8")
      })
    } else if (fs.statSync(itemPath).isDirectory()) {
      writeDirectory(templateDir, itemPath, api);
    }
  }
}

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

  api.addRuntimePluginKey(() => ["hcLayout", "onHcSiderCollapse"]);// runtime中函数注册支持
  api.addRuntimePlugin({
    fn: () => withTmpPath({api, path: "runtime.tsx"}),
    stage: Number.MAX_SAFE_INTEGER,
  });

  function isUseNginxBuild() {
    const dockerFile = `${api.paths.cwd}/Dockerfile`;
    return !fs.existsSync(dockerFile);
  }


  // 修改项目配置
  api.modifyConfig((memo, {paths}) => {

    // 检测是使用docker部署??
    const useNginxBuild = isUseNginxBuild();
    if (useNginxBuild) {
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
        ...useNginxBuild ? {shouldNotModifyRuntimePublicPath: true,} : {},
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
    const useAntd = (() => {
      try {
        const pkg = require('antd/package.json');
        return pkg.version;
      } catch (e) {
        return false
      }
    })();

    const useYhDesign = (() => {
      try {
        require.resolve('@yh/yh-design');
        return true
      } catch (e) {
        return false
      }
    })();

    if (useAntd) {
      api.writeTmpFile({
        path: "403.tsx",
        tplPath: join(__dirname, "403.antd.tsx.tpl"),
        context: {},
      });
    }
    if (useYhDesign) {
      api.writeTmpFile({
        path: "403.tsx",
        tplPath: join(__dirname, "403.yh-design.tsx.tpl"),
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
      tplPath: join(__dirname, "runtime.tsx.tpl"),
      context: {
        page403: withCustom403 ? '@/pages/403' : withTmpPath({api, path: '403.tsx'}),
      },
    });

    const config = api.config;
    // layout 生成
    let generateLayout = config.hc.layout;
    let message = '';
    if (!!generateLayout) {
      if (generateLayout === true) {
        // 从node_modules 中自动检测
        if (useAntd) {
          switch (parseInt(useAntd)) {
            case 4:
              generateLayout = 'antd@4';
              break;
            case 5:
              generateLayout = 'antd@5';
              break;
            default:
              message = '当前antd 版本未支持Layout，请联系脚手架人员支持';
              break;
          }
        }
        if (generateLayout === true && useYhDesign) {
          generateLayout = 'yh-design'
        }
      }
      if (generateLayout === true) {
        // 未检测到
        if (message) {
          api.logger.error(message);
        }
        generateLayout = false;
      }

      if (generateLayout) {
        const templateDir = path.join(tmpDir, `layout/${generateLayout}`);
        writeDirectory(templateDir, templateDir, api);
        // 注册 addLayout操作。 检测和 layout 是否冲突，只能存在一个，如果layout也设置了则给出报错提示。
        api.addLayouts(() => {
          return {
            id: 'hc-layout',
            file: withTmpPath({api, path: "layout/index.tsx"}),
            test: (route: { layout?: boolean }) => {
              return route.layout !== false; // layout 可以配置，从而部分页面不加载布局。
            }
          }
        })
      }
    }

    // 从runtime 中获取layout参数，如菜单宽、高、内容宽高，需要注册

    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
type LayoutType = {
  sideMenuMin?: number;
  sideMenuMax?: number;
  contentBoxPadding?: number;
};
export interface IRuntimeConfig {
  hcLayout?: ()=>LayoutType;
  onSiderCollapse?: (collapsed: boolean)=>void;
}
      `,
    });
  });
};
