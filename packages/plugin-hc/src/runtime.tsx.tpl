import React from 'react';
import { fetchPermissions } from './fetchPermissions';
import Page403 from '{{{page403}}}';
import { permissionsRef } from './permissionsRef';

function cleanNotAccessRoutes(routes){
  routes.forEach((route: any) => {
    const { permission, routes: subRoutes } = route;
    if(permission && permissionsRef.current && !permissionsRef.current.has(permission) && route.element){
      route.element = <Page403/>;
    }
    if(subRoutes){
      cleanNotAccessRoutes(subRoutes);
    }
  });
}


export function patchClientRoutes({ routes }) {
  // 处理permission 没有的页面
  cleanNotAccessRoutes(routes);
}

export function render(oldRender) {
  fetchPermissions().then(({permissions})=>{
    permissionsRef.current = new Set(permissions);
    oldRender();
  }).catch(()=>{
    // 权限获取失败
    oldRender();
  });
}
