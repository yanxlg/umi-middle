/*
 * @author: yanxianliang
 * @date: 2024-01-06 22:44
 * @desc: 客户端菜单，固定的菜单数据
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import { MenuItem } from '@@/plugin-hc/useMenu';

export const clientMenus: MenuItem[] = [
  {
    title: '导出管理',
    key: 'wos-order-export',
    icon: 'download',
    children: [
      {
        title: '导出任务',
        key: '/wos/system/export_copy',
        url: '/wos/system/export',
      },
    ],
  },
];
