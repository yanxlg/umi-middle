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
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

const git = simpleGit({ baseDir: process.cwd() });


function getDate(branchName: string){
  const dateStr = branchName.replace(/[^\d]/g,'');
  const length = dateStr.length;
  const currentYear = new Date().getFullYear() + '';
  switch (length) {
    case 8:
      return dateStr;
    case 6: // 没有20
      return currentYear.substring(0,2) + dateStr;
    case 4:
      return currentYear + dateStr;
  }
  return dayjs().format('YYYYMMDD');
}


export async function run() {
  const { current: _current, all } = await git.branch(); // 是不是所有的远程分支都能拿到
  const current = process.env.CI_COMMIT_REF_NAME || _current;

  if (/^release/.test(current)) {
    const unMergedReleaseSet = new Set();

    const currentDate = getDate(current);

    const releaseBranches = all.map(branch=>{
      if(/^remotes\/origin\//.test(branch)){
        const branchName = branch.replace(/^remotes\/origin\//, "");
        const branchDate = getDate(branchName);
        if (/^release/.test(branchName) && branchName !== current && dayjs(branchDate).isSameOrBefore(currentDate,'d')){
          return branchName;
        }
      }
      return '';
    }).filter(Boolean).sort((prev:string,next:string)=>dayjs(prev).isBefore(dayjs(next))?-1:1);

    if(releaseBranches.length>0){
      const lastBranch = releaseBranches[releaseBranches.length-1];
      const preBranches = releaseBranches.filter(branch=>getDate(branch)===getDate(lastBranch));

      for (let branch of preBranches){
        const { total } = await git.log({
          from: `origin/${current}`,
          to: `origin/${branch}`,
          symmetric: false,
        });
        if (total > 0) {
          unMergedReleaseSet.add(branch);
        }
      }
    }

    let unMergedReleaseBranches = Array.from(unMergedReleaseSet);
    if (unMergedReleaseBranches.length > 0) {
      console.error(
        chalk.red(
          `前置release分支[${chalk.blueBright(
            unMergedReleaseBranches.join("、")
          )}]未合并到当前分支中，请检查前置release分支是否完整合并到master主分支`
        )
      );
      process.exit(1);
    }
  }
}
