/*
 * @Author: yanxlg
 * @Date: 2023-05-04 23:18:33
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-17 22:47:22
 * @Description: 执行release 分支检查，检查master是否合并出当前分支以外的所有release分支
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {simpleGit} from "simple-git";

const git = simpleGit({baseDir: process.cwd()});


export async function run(sitBranch: string, mainBranch: string,commonDirs: string) {
  // diff sit分支与主分支。测试分支可以指定，默认sit。
  if(!sitBranch || !mainBranch || !commonDirs){
    console.log('---------------------git diff report: 配置不完善----------------------');
    return;
  }

  const diff = await git.diffSummary([mainBranch,sitBranch]);
  const {files} = diff;

  console.log(files);

  if(files.length ===0){
    console.log('---------------------git diff report: no file change----------------------');
    return;
  }
  console.log('---------------------git diff report start----------------------');
}
