/*
 * @Author: yanxlg
 * @Date: 2023-05-04 23:18:33
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-17 22:47:22
 * @Description: 执行release 分支检查，检查master是否合并出当前分支以外的所有release分支
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { program } from "commander";
import { run } from "./index";

program.name("release-check");
program.option("--main-branch <mainBranch>", "project main branch", "master");
program.action(async (options) => {
  const mainBranch = options["main-branch"];
  await run(mainBranch);
});

program.parse();
