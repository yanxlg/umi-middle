// @ts-nocheck
// This file is generated by Umi automatically
// DO NOT CHANGE IT MANUALLY!
import routeProps from './routeProps';

if (process.env.NODE_ENV === 'development') {
  Object.entries(routeProps).forEach(([key, value]) => {
    const internalProps = ['path', 'id', 'parentId', 'isLayout', 'isWrapper', 'layout', 'clientLoader'];
    Object.keys(value).forEach((prop) => {
      if (internalProps.includes(prop)) {
        throw new Error(
          `[UmiJS] route '${key}' should not have '${prop}' prop, please remove this property in 'routeProps'.`
        )
      }
    })
  })
}

import React from 'react';

export async function getRoutes() {
  const routes = {"Home/index":{"path":"Home","id":"Home/index"}} as const;
  return {
    routes,
    routeComponents: {
'Home/index': React.lazy(() => import(/* webpackChunkName: "src__pages__Home__index" */'../../../src/pages/Home/index.tsx')),
},
  };
}
