/*
 * @Author: yanxlg
 * @Date: 2023-04-26 13:58:45
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-28 00:08:22
 * @Description: 辉创公共能力
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */

import { useMenu } from './useMenu';
import { usePermissions } from './usePermissions';

export { useMenu, usePermissions };

export type MenuItem = {
  icon: string;
  key: string;
  permission: string;
  title: string;
  url: string;
  children?: Array<MenuItem>;
}
