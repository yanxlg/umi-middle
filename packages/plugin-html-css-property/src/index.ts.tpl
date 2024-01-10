/*
 * @Author: yanxlg
 * @Date: 2023-04-26 13:58:45
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-28 00:08:22
 * @Description: 更新root节点样式变量值
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */

function updateHtmlCssProperties(properties: {{{type}}}) {
  const root = document.documentElement;
  Object.keys(properties).forEach((key)=>{
    root.style.setProperty(key, properties[key]);
  });
}

export { updateHtmlCssProperties };
