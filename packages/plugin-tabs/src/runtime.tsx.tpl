import React from 'react';
import { AliveScope, NodeKey, autoFixContext, createContext } from 'react-activation';
import { KeepAliveWrapper } from './KeepAliveWrapper';


{{#reactExternal}}
// 全局React 修复, umd 引入问题
if(window && window.React && !window.React['_react_activation_fix_context']) {
  const originReact = window.React;
  window.React = {...originReact, createContext, _react_activation_fix_context: true};
}
{{/reactExternal}}

// @ts-ignore
NodeKey.defaultProps.onHandleNode = (node, mark) => {
  // 因异步组件 loaded 后会去掉 LoadableComponent 层，导致 nodeKey 变化，缓存定位错误
  // 故排除对 LoadableComponent 组件的标记，兼容 dynamicImport
  if (node.type && node.type.displayName === 'LoadableComponent') {
    return undefined;
  }

  return mark;
};

export function rootContainer(container: React.ReactNode, clientProps: any) {    
  return (
    <AliveScope>{container}</AliveScope>
  );
}


function wrapPageWithComponent(children: any) {
  const originElement = children.element;
  if (originElement && originElement.type?.name === 'NavigateWithParams') {
    // redirect重定向。忽略
    return;
  }
  if (children.children) {
    if (Array.isArray(children.children)) {
      children.children.forEach((child) => wrapPageWithComponent(child));
    } else {
      wrapPageWithComponent(children.children);
    }
    return;
  }
  // children.element = React.cloneElement(children.element, {
  //     children:<KeepAliveWrapper>{originElement.props.children}</KeepAliveWrapper>
  //   });
  // 不能是同一个组件，需要创建不同的组件。
  if (React.isValidElement(originElement)) {
    children.element = (
      <KeepAliveWrapper>{originElement}</KeepAliveWrapper>
    );
  }
}

export const patchClientRoutes = ({ routes }: any) => {
  routes.forEach((route: any) => {
    const { children, isLayout } = route;
    if(isLayout){
      children?.forEach((child: any) => {
        wrapPageWithComponent(child);
      });
    }else{
      wrapPageWithComponent(route);
    }
  });
};
