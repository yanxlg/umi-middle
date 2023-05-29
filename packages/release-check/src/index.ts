/*
 * @Author: yanxlg
 * @Date: 2023-05-04 23:18:33
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-17 22:47:22
 * @Description: 执行release 分支检查，检查master是否合并出当前分支以外的所有release分支
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import simpleGit from "simple-git";

const git = simpleGit();

export async function run(mainBranch: string) {
  const { current, all } = await git.branch(["--remotes"]); // 是不是所有的远程分支都能拿到
  // 当前是release分支，执行检测
  if (/^release/.test(current)) {
    console.log(`当前分支：${current}`);
    console.log(`所有分支：${all.join(" ")}`);
    const releaseSet = new Set<string>();
    all.forEach((branch) => {
      if (/^release/.test(branch)) {
        releaseSet.add(branch);
      }
    });
    releaseSet.delete(current);

    await git.checkout(mainBranch); // 切换到基础分支
    const { all: mergedBranches } = await git.branch(["--merged"]);
    console.log(`主分支已合并分支：${mergedBranches.join(" ")}`);
    // 查询baseBranch 的merge列表
    const mergedBranchSet = new Set(mergedBranches);
    let unMergedReleaseBranches = [];
    releaseSet.forEach((target) => {
      if (!mergedBranchSet.has(target)) {
        unMergedReleaseBranches.push(target);
      }
    });
    await git.checkout(current); // 切换回原来的分支
    if (unMergedReleaseBranches.length > 0) {
      throw new Error(
        `存在release分支未合并到主分支，新的release分支代码可能不完整，请处理完下列分支合并操作后重新发布编译动作：${unMergedReleaseBranches.join(
          " "
        )}`
      );
    }
  }
}
