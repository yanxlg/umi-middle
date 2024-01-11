import React from "react";
import { MenuItem } from '@@/plugin-hc/useMenu';

type TabType = {
  defaultTabs?: Array<string | {key: string; closeable?: boolean}>;
};

export interface IRuntimeConfig {
  tabs?: () => TabType;
}
