/*
 * @Author: yanxlg
 * @Date: 2023-05-04 23:18:33
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-17 22:47:22
 * @Description: 检测代码变动，生成影响文档
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import * as commander from "commander";
import {run} from "./index";
import * as process from "process";


const program = commander.program || commander;

program.name("git-diff-report");
program.option("--sit-branch <devBranch>", "测试分支", "sit");
program.option("--main-branch <mainBranch>", "主分支", "master");
program.option("--common-dirs <commonDirs>", "公共目录");
program.action(async (name, options) => {
  const sitBranch = options['sit-branch'];
  const mainBranch = options['main-branch'];
  const commonDirs = options['common-dirs'];
  console.log(options);
  await run(sitBranch,mainBranch,commonDirs);
});

program.parse(process.argv);
