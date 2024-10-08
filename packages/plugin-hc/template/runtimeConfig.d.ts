import React from "react";
import { MenuItem } from '@@/plugin-hc/useMenu';

type LayoutType = {
  siderMinWidth?: number;
  siderMaxWidth?: number;
  contentPadding?: number;
  headerHeight?: number;
  layoutWrapper?: React.ClassType<any, any, any> | React.FunctionComponent;// Wrapper 组件，children 为Layout组件，可以向Layout传递props.
  patchClientMenus?: (menus:MenuItem[])=>MenuItem[];
  menuAppCode?: string;
  renderIcon?: (icon: string) => React.ReactNode; // 图标渲染
};

export interface IRuntimeConfig {
  hcLayout?: () => LayoutType;
}
