/*
 * @Author: yanxlg
 * @Date: 2023-05-04 23:18:33
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-05 19:27:50
 * @Description:
 *  TODO:
 *    asset包build 进行工程化，配合father完成，直接指定内部.fatherrc.ts作为配置文件，外部不提供新的配置文件。
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { logger, printHelp, yParser } from "@umijs/utils";
import { program } from "commander";
import { join } from "path";
import { run } from "umi";
import { Service } from "umi/dist/service/service";

import { Service as FatherService } from "father/dist/service/service";

program.name("middle");

program.command("asset").action(async () => {
  // 生成低代码资产包
  process.env.NODE_ENV = "development";
  // @1 调用 umi setup 生成相关文件。
  try {
    const args = yParser(process.argv.slice(2), {
      alias: {
        version: ["v"],
        help: ["h"],
      },
      boolean: ["version"],
    });
    process.env.UMI_PRESETS = require.resolve("./middle-preset");
    await new Service().run2({
      name: "setup",
      args,
    });
    // @2 调用 father build 编译
    // 配置根目录
    const cwd = process.cwd();
    process.chdir(join(cwd, "src/.umi/plugin-asset/")); // 修改执行地址，影响编译使用的fatherrc配置文件
    const service = new FatherService();
    await service.run2({
      name: "build",
      args,
    });
  } catch (e: any) {
    logger.fatal(e);
    printHelp.exit();
    process.exit(1);
  }
});

program.action(() => {
  // max命令
  run({
    presets: [
      require.resolve("@umijs/max/dist/preset"), // preset 默认是max的preset
      require.resolve("./middle-preset"),
    ],
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
});

program.parse(process.argv);
