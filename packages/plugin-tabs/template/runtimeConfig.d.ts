import {IWindowTabsProps} from './WindowTabs';

export interface IRuntimeConfig {
  tabs?: () => IWindowTabsProps;
}
