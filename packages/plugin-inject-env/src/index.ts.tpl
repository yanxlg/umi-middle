/*
 * @Author: yanxlg
 * @Date: 2023-04-26 13:58:45
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-28 00:08:22
 * @Description: 环境变量注入
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */

const defaultValue = {{{defaultValue}}};

function getInjectEnv(envKey: {{{keys}}}) {
  // 获取
  return !window.__inject_env__ ||
    !window.__inject_env__[envKey] ||
    /^__runtime_env/.test(window.__inject_env__[envKey])
    ? defaultValue[envKey]
    : window.__inject_env__[envKey];
}

export { getInjectEnv };
