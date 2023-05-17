/*
 * @Author: yanxlg
 * @Date: 2023-05-04 23:18:33
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-17 13:18:15
 * @Description:
 *  TODO:
 *    asset包build 进行工程化，配合father完成，直接指定内部.fatherrc.ts作为配置文件，外部不提供新的配置文件。
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { pluginKey } from "@middle/plugin-asset";
import { logger, printHelp, yParser } from "@umijs/utils";
import { program } from "commander";
import { Service as FatherService } from "father/dist/service/service";
import * as fs from "fs";
import { join } from "path";
import { run } from "umi";
import { Service } from "umi/dist/service/service";

program.name("middle");

program.command("asset").action(async () => {
  // 生成低代码资产包
  process.env.NODE_ENV = "production";
  try {
    const args = yParser(process.argv.slice(2), {
      alias: {
        version: ["v"],
        help: ["h"],
      },
      boolean: ["version"],
    });
    process.env.UMI_PRESETS = process.env.UMI_PRESETS = [
      require.resolve("@umijs/max/dist/preset"),
      require.resolve("./asset-preset"),
    ].join(",");

    await new Service().run2({
      name: "setup",
      args,
    });

    // antd 语言包处理 locale/zh_CN.js 覆盖locale/en_US
    const antPkgPath = require.resolve("antd");
    if (antPkgPath) {
      fs.writeFileSync(
        require.resolve("antd/es/locale/en_US.js"),
        fs.readFileSync(require.resolve("antd/es/locale/zh_CN.js"), "utf8")
      );
      fs.writeFileSync(
        require.resolve("antd/es/locale/default.js"),
        fs.readFileSync(require.resolve("antd/es/locale/zh_CN.js"), "utf8")
      );
      fs.writeFileSync(
        require.resolve("antd/lib/locale/en_US.js"),
        fs.readFileSync(require.resolve("antd/lib/locale/zh_CN.js"), "utf8")
      );
      fs.writeFileSync(
        require.resolve("antd/lib/locale/default.js"),
        fs.readFileSync(require.resolve("antd/lib/locale/zh_CN.js"), "utf8")
      );
    }

    // @2 调用 father build 编译
    // 配置根目录
    const cwd = process.cwd();
    // 开发模式是.umi。production 模式是.umi-production
    // 检查文件夹是否存在
    const devDir = `src/.umi/plugin-${pluginKey}`;
    const prodDir = `src/.umi-production/plugin-${pluginKey}`;
    const devDirExist = fs.existsSync(join(cwd, devDir));

    process.chdir(
      join(
        cwd,
        process.env.NODE_ENV === "production"
          ? prodDir
          : devDirExist
          ? devDir
          : prodDir
      )
    ); // 修改执行地址，影响编译使用的fatherrc配置文件
    const service = new FatherService();
    await service.run2({
      name: "build",
      args,
    });

    // 恢复文件内容
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
