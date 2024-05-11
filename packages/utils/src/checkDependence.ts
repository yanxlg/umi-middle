/*
 * @author: yanxianliang
 * @date: 2024-01-10 17:58
 * @desc: 依赖包检测，检测项目中使用的UI库及版本号，针对不同的包和版本执行不同的处理
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */

import fs from "fs";

export function checkDependence(){
  const antdVersion = (() => {
    try {
      const pkg = require('antd/package.json');
      return pkg.version;
    } catch (e) {
      return false
    }
  })();

  const useYhDesign = (() => {
    try {
      require.resolve('@yh/yh-design');
      return true
    } catch (e) {
      return false
    }
  })();

  const useAntd = !!antdVersion;

  return {
    useAntd: useAntd,
    antdVersion,
    useYhDesign: !useAntd && useYhDesign, // 优先使用antd，其次使用yh-design
    buildWithNginx: !fs.existsSync(`${process.cwd()}/Dockerfile`)
  }
}
