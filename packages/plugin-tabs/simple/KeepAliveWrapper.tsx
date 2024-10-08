/*
 * @Author: yanxlg
 * @Date: 2023-04-29 09:27:17
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-29 12:31:46
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import React, {PropsWithChildren, useMemo} from "react";
import {KeepAlive} from "react-activation";
import {useLocation, matchRoutes, RouteObject} from "react-router-dom";


export const KeepAliveWrapper: React.FC<PropsWithChildren<{
  routes: Array<RouteObject>
}>> = (
  {
    children,
    routes
  }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const route = useMemo(() => matchRoutes(routes, pathname)?.pop()?.route, []);
  // 支持特殊页面不缓存
  if (route?.noCache) {
    return children;
  }
  const saveScrollPosition = route?.saveScrollPosition ?? 'screen';
  return (
    <KeepAlive
      name={location.pathname}
      key={location.pathname}
      id={location.pathname}
      cacheKey={location.pathname}
      saveScrollPosition={saveScrollPosition}
    >
      {children}
    </KeepAlive>
  );
};
