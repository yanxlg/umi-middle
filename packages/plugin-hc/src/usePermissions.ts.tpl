/*
 * @Author: yanxlg
 * @Date: 2023-04-26 13:58:45
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-28 00:08:22
 * @Description: 获取辉创权限
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {useState, useEffect} from 'react';



function usePermissions(){
  const [permissionState,setPermissionState] = useState<{
    loading: boolean;
    permissions: Array<string>;
    responseXHR?: XMLHttpRequest;
  }>({
    loading: false,
    permissions: [],
  });

  useEffect(() => {
    setPermissionState({
      loading: true,
      permissions: [],
    });
    const xhr = new XMLHttpRequest();
    xhr.open('get', `/user/permissions`);
    xhr.onload = function () {
      let responseText = xhr.responseText;
      if (xhr.status == 200) {
        try {
          const {code,data} = JSON.parse(responseText);
          if(code === 0){
            setPermissionState({
              loading: false,
              permissions: data.permissions.split(','),
              responseXHR: xhr
            });
          }else{
            setPermissionState({
              loading: false,
              permissions: [],
              responseXHR: xhr
            });
          }
        } catch (e) {
          setPermissionState({
            loading: false,
            permissions: [],
            responseXHR: xhr
          });
        }
      } else {
        setPermissionState({
          loading: false,
          permissions: [],
          responseXHR: xhr
        });
      }
    };
    xhr.onerror = function (e){
      setPermissionState({
        loading: false,
        permissions: [],
        responseXHR: xhr
      });
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader("Accept", "application/json, text/plain, */*");

    xhr.send();
  }, []);
  
  return permissionState;
}

export { usePermissions };