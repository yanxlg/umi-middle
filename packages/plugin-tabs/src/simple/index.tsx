/*
 * @author: yanxianliang
 * @date: 2023-10-21 11:27
 * @desc: $Desc$
 *
 * Copyright (c) 2023 by yanxianliang, All Rights Reserved.
 */
import React from 'react';
import {AliveScope, NodeKey, autoFixContext, createContext} from 'react-activation';
import {KeepAliveWrapper} from './KeepAliveWrapper';
import {RouteObject} from "react-router-dom";
import {type} from "os";

// 全局React 修复, umd 引入问题
// @ts-ignore
if (window && window.React && !window.React['_react_activation_fix_context']) {
  const originReact = window.React;
  // @ts-ignore
  window.React = {...originReact, createContext, _react_activation_fix_context: true};
}

// @ts-ignore
NodeKey.defaultProps.onHandleNode = (node, mark) => {
  // 因异步组件 loaded 后会去掉 LoadableComponent 层，导致 nodeKey 变化，缓存定位错误
  // 故排除对 LoadableComponent 组件的标记，兼容 dynamicImport
  if (node.type && node.type.displayName === 'LoadableComponent') {
    return undefined;
  }

  return mark;
};


export function rootContainer(container: React.ReactNode) {
  return (
    <AliveScope>{container}</AliveScope>
  );
}


function wrapPageWithComponent(route: RouteObject, routes: Array<RouteObject>) {
  const originElement = route.element;
  // @ts-ignore
  if (originElement && originElement.type?.name === 'NavigateWithParams') {
    // redirect重定向。忽略
    return;
  }
  if (route.children) {
    if (Array.isArray(route.children)) {
      route.children.forEach((child) => wrapPageWithComponent(child, routes));
    } else {
      wrapPageWithComponent(route.children, routes);
    }
    return;
  }
  // children.element = React.cloneElement(children.element, {
  //     children:<KeepAliveWrapper>{originElement.props.children}</KeepAliveWrapper>
  //   });
  // 不能是同一个组件，需要创建不同的组件。
  if (React.isValidElement(originElement)) {
    route.element = (
      <KeepAliveWrapper routes={routes}>{originElement}</KeepAliveWrapper>
    );
  }else if(typeof originElement === 'function'){
    const OriginElement = originElement as React.ComponentType;
    route.element = (
      <KeepAliveWrapper routes={routes}><OriginElement/></KeepAliveWrapper>
    );
  }
}


export function patchClientRoutes(routes: Array<RouteObject>) {
  routes.map((route) => {
    return wrapPageWithComponent(route, routes);
  });
  return routes;
}
