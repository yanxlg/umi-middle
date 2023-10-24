/*
 * @Author: yanxlg
 * @Date: 2023-04-26 13:58:45
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-28 00:08:22
 * @Description: 获取辉创菜单
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import React,{useState} from 'react';

function useMenu(){
  const [menuState,setMenuState] = useState({
    loading: false,
    menus: []
  });
  // 请求
  
}

export { useMenu };
