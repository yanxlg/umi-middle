/*
 * @Author: yanxlg
 * @Date: 2023-05-04 23:18:33
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-17 22:47:22
 * @Description: 执行release 分支检查，检查master是否合并出当前分支以外的所有release分支
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { chalk } from "@umijs/utils";
import { simpleGit } from "simple-git";

const git = simpleGit({ baseDir: process.cwd() });

export async function run() {
  const { current: _current, all } = await git.branch(); // 是不是所有的远程分支都能拿到
  const current = process.env.CI_COMMIT_REF_NAME || _current;

  if (/^release/.test(current)) {
    const unMergedReleaseSet = new Set();
    // 不需要检测master，判断当前分支就可以
    for (let branch of all) {
      if (/^remotes\/origin\//.test(branch)) {
        const branchName = branch.replace(/^remotes\/origin\//, "");
        if (/^release/.test(branchName) && branchName !== current) {
          // 获取最后一次提交，查看最后一次提交是否在logs中
          const { total } = await git.log({
            from: `origin/${current}`,
            to: `origin/${branchName}`,
            symmetric: false,
          });
          if (total > 0) {
            unMergedReleaseSet.add(branchName);
          }
        }
      }
    }
    let unMergedReleaseBranches = Array.from(unMergedReleaseSet);
    if (unMergedReleaseBranches.length > 0) {
      console.error(
        chalk.red(
          `存在release分支代码未合并到当前分支（上线后没有合并到master），新的release分支代码不完整，请处理完下列分支合并操作后重新发布编译动作：${chalk.blueBright(
            unMergedReleaseBranches.join(" ")
          )}`
        )
      );
      process.exit(1);
    }
  }
}
