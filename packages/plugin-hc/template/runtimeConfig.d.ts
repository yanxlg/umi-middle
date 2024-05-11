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
};

export interface IRuntimeConfig {
  hcLayout?: () => LayoutType;
}
