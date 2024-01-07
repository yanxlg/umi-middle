{{#antdPrefix}}
export const antdPrefix = "{{{antdPrefix}}}";
{{/antdPrefix}}
{{#title}}
export const title = "{{{title}}}";
{{/title}}

declare module 'react-router-dom' {
  interface RouteObject {
    title: string;
    permission?: string;
    layout?: boolean | string; // 页面是否需要布局，或者自定义布局类型
    login?: boolean; // 页面是否需要检测登陆
  }
}
