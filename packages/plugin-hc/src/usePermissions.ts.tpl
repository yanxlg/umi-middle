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
import {fetchPermissions} from './fetchPermissions';
import { permissionsRef } from './permissionsRef';

function usePermissions(){
  const [permissionState,setPermissionState] = useState<{
    loading: boolean;
    permissions: Array<string>;
    responseXHR?: XMLHttpRequest;
  }>({
    loading: false,
    permissions: permissionsRef.current?Array.from(permissionsRef.current): [],
  });

  useEffect(() => {
    if(!permissionsRef.current){
      setPermissionState({
        loading: true,
        permissions: [],
      });
      fetchPermissions().then(({permissions,responseXHR})=>{
        permissionsRef.current = new Set(permissions);
        setPermissionState({
          loading: false,
          permissions: permissions,
          responseXHR: responseXHR
        });
      }).catch((xhr)=>{
        setPermissionState({
          loading: false,
          permissions: [],
          responseXHR: xhr
        });
      });
    }
  }, []);

  return permissionState;
}

function hasPermission(permission: string){
  return permissionsRef.current?.has(permission);
}

function useHasPermissions(permissions: string[]){
  const {permissions} = usePermissions();
  const set = new Set(permissions);
  return permissions.map(permission => set.has(permission));
}

export { usePermissions, hasPermission, useHasPermissions };
