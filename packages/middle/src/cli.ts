/*
 * @Author: yanxlg
 * @Date: 2023-05-04 23:18:33
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-30 15:07:45
 * @Description: 工程化cli包
 *
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { pluginKey } from "@middle-cli/plugin-material";
import { yParser, logger, chalk } from "@umijs/utils";
import { program } from "commander";
import { Service as FatherService } from "father/dist/service/service";
import { join } from "path";
import { run } from "umi";
import { Service } from "umi/dist/service/service";
import * as process from "process";
import fsExtra from 'fs-extra';

import {Config, Env} from '@umijs/core';
import {DEFAULT_CONFIG_FILES} from 'umi/dist/constants';
import path from "path";

const version = require('../package.json').version;

program.name("middle");

program.action(() => {
  const args = yParser(process.argv.slice(2), {
    alias: {
      version: ["v"],
      help: ["h"],
    },
    boolean: ["version"],
  });
  const command = args._[0];

  if(command === 'version' || args.version){
    logger.info(chalk.yellow('[你知道吗？] 如果想要了解更多，详见 https://middle.yonghui.cn/scaffold/react/overflow'));
    console.log(`middle@${version}`);
    return;
  }

  const env = command === 'build'? 'production': 'development';

  const configManager = new Config({
    cwd: process.cwd(),
    env: Env[env],// 根据命令来获取
    defaultConfigFiles: DEFAULT_CONFIG_FILES,
  });
  const config = configManager.getUserConfig().config;
  if((config as any).material && command === 'build'){
    (async ()=>{
      process.env.NODE_ENV = "production";
      // 需要删除.umi文件夹
      fsExtra.rmSync(path.join(process.cwd(), 'src/.umi'),{
        recursive: true,
        force: true
      });
      await new Service({
        presets:[
          require.resolve("@umijs/max/dist/preset"), // preset 默认是max的preset
          require.resolve("./custom-preset"),
        ],
      }).run2({
        name: "setup",
        args,
      });
      process.env.APP_ROOT = join(process.cwd(), `src/.umi-production/plugin-${pluginKey}`);// father 执行根目录
      const service = new FatherService();
      await service.run2({
        name: "build",
        args,
      });
    })();
    return;
  }

  // max命令
  run({
    presets: [
      require.resolve("@umijs/max/dist/preset"), // preset 默认是max的preset
      require.resolve("./custom-preset"),
    ],
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}).allowUnknownOption(true);

program.parse();
