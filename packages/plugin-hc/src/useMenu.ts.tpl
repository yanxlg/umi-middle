/*
 * @Author: yanxlg
 * @Date: 2023-04-26 13:58:45
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-28 00:08:22
 * @Description: 获取辉创菜单
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {useState, useEffect} from 'react';


export type MenuItem = {
  icon: string;
  key: string;
  permission: string;
  title: string;
  url: string;
  children?: Array<MenuItem>;
}

function useMenu(appCode: string){
  const [menuState,setMenuState] = useState<{
    loading: boolean;
    menus: Array<MenuItem>;
    responseXHR?: XMLHttpRequest;
  }>({
    loading: false,
    menus: [],
  });

  useEffect(() => {
    setMenuState({
      loading: true,
      menus: [],
    });
    const xhr = new XMLHttpRequest();
    xhr.open('post', `/app/api/auth-hub/auth/menus?timestamp=${Date.now()}`);
    xhr.onload = function () {
      let responseText = xhr.responseText;
      if (xhr.status == 200) {
        try {
          const {code,data} = JSON.parse(responseText);
          if(code === 0){
            setMenuState({
              loading: false,
              menus: data,
              responseXHR: xhr
            });
          }else{
            setMenuState({
              loading: false,
              menus: [],
              responseXHR: xhr
            });
          }
        } catch (e) {
          setMenuState({
            loading: false,
            menus: [],
            responseXHR: xhr
          });
        }
      } else {
        setMenuState({
          loading: false,
          menus: [],
          responseXHR: xhr
        });
      }
    };
    xhr.onerror = function (e){
      setMenuState({
        loading: false,
        menus: [],
        responseXHR: xhr
      });
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader("Accept", "application/json");

    xhr.send(JSON.stringify({app: appCode}));
    }, []);
  return menuState;
}

export { useMenu };
