/*
 * @Author: yanxlg
 * @Date: 2023-04-27 11:38:53
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-19 10:41:11
 * @Description:
 * 属性优先级：props > runtime > config
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {join} from "path";
import {IApi} from "umi";
import {winPath} from "umi/plugin-utils";
import { checkDependence} from '@middle-cli/utils';
import fs from "fs";

export function withTmpPath(opts: {
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

const tmpDir = winPath(join(__dirname, "..", "template","components")); // 模版目录

function copyDirectory(baseTemplateDir: string, api: IApi, context: object, directoryPath?: string) {
  // 读取指定路径下的所有文件和子目录
  const directory = join(baseTemplateDir, directoryPath||'');
  const filesAndDirectories = fs.readdirSync(directory);
  for (let i = 0; i < filesAndDirectories.length; i++) {
    const fileOrDirName = filesAndDirectories[i];
    const itemPath = join(directory, fileOrDirName);
    if (fs.statSync(itemPath).isFile()) {
      if(/\.tpl$/.test(fileOrDirName)){
        api.writeTmpFile({
          path: join(directoryPath||'', fileOrDirName).replace(/\.tpl$/,''),
          tplPath: itemPath,
          context: context
        })
      }else{
        api.writeTmpFile({
          path: join(directoryPath||'', fileOrDirName), // 生成目录文件
          content: fs.readFileSync(itemPath, "utf-8")
        });
      }
    } else if (fs.statSync(itemPath).isDirectory()) {
      copyDirectory(baseTemplateDir, api, context, join(directoryPath||'', fileOrDirName));
    }
  }
}

export default (api: IApi) => {
  api.describe({
    key: "chrome49", // 适配chrome 49
    config:{
      schema({zod}) {
        return zod.boolean().optional();
      },
      onChange: api.ConfigChangeType.reload
    },
    enableBy: api.EnableBy.config, // chrome49兼容
  });

  const {antdVersion} = checkDependence();
  if(!(parseInt(antdVersion) >=5)){
    throw new Error('chrome 49 兼容插件仅支持ant@5');
  }

  api.modifyConfig((memo, {paths}) => {
    memo.jsMinifier = memo.jsMinifier || 'terser';
    memo.cssMinifier = memo.cssMinifier || 'cssnano';
    memo.targets = { ...memo.targets || {},chrome: 49 };
    memo.autoprefixer = {
      ...memo.autoprefixer || {},
      // flexbox: true, // 好像没什么用
    };
    if(memo.antd){
      memo.antd = {
        ...memo.antd,
        styleProvider: undefined,// styleProvider 需要删除，手动添加rootContainer
      }
    }

    return memo;
  })

  api.addExtraBabelPlugins(()=> {
    return withTmpPath({ api, path: "babel-plugin" });
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: "babel-plugin.js",
      tplPath: join(__dirname, "babel-plugin.js"),
      context: {},
    });

    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(__dirname, "..", "template", "runtime.tsx.tpl"),
      context: {
        styleProvider: {
          hashPriority: 'high'
        },
      },
    });

    const prefixCls = api.config.antd?.configProvider?.prefixCls ?? 'ant';
    api.writeTmpFile({
      path: "global.less",
      tplPath: join(__dirname, "..", "template", "global.less.tpl"),
      context: {
        prefixCls: prefixCls,
      },
    });

    api.writeTmpFile({
      path: "prefixer.ts",
      tplPath: join(__dirname, "..", "template", "prefixer.ts.tpl"),
      context: {
      },
    });


    // copy 所有文件
    copyDirectory(tmpDir, api, {});
  });

  api.addRuntimePlugin({
    fn: () => withTmpPath({api, path: "runtime.tsx"}),
    stage: -1 * Number.MAX_SAFE_INTEGER
  });
};
