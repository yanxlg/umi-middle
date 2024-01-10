/*
 * @author: yanxianliang
 * @date: 2024-01-06 23:05
 * @desc: Desc
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import { clientMenus } from './clientMenus.ts';
import { MenuItem } from '@@/plugin-hc/useMenu';
import { MenuDataItem } from '@umijs/route-utils';

export const conversionPath = (path: string) => {
  if (path && path.indexOf('http') === 0) {
    return path;
  }
  return `/${path || ''}`.replace(/\/+/g, '/');
};

export const isUrl = function isUrl(path: string) {
  if (!path.startsWith('http')) {
    return false;
  }
  try {
    const url = new URL(path);
    return !!url;
  } catch (error) {
    return false;
  }
};

export const toMenuDataItems = (menus: MenuItem[]): MenuDataItem[] => {
  return menus.map((menu) => {
    return {
      ...menu,
      key: menu.key?.replace(/^#/, ''),
      path: menu.url,
      name: menu.title,
      children: menu.children ? toMenuDataItems(menu.children) : undefined,
    };
  });
};

export const fillClientMenus = (menus: MenuItem[]) => {
  // Apply 菜单手动添加
  const workSet = menus.find((item) => item.key === 'work-setting');
  if (workSet !== undefined) {
    const publicReply = {
      title: '公共回复模板',
      key: '#/setting/reply',
      url: '/setting/reply',
    };
    workSet.children = workSet.children || [];
    workSet.children.push(publicReply);
  }
  const order = menus.find((item) => item.key === 'wos-order');
  if (order !== undefined) {
    const myOrder = order.children?.find((t) => t.key === '/order/my');
    if (myOrder !== undefined) {
      const personalReply = {
        title: '个人回复模板',
        key: '#/order/my/reply',
        url: '/order/my/reply',
      };
      myOrder.children = myOrder.children || [];
      myOrder.children.push(personalReply);
    }
  }
  menus.push(...clientMenus);
  return toMenuDataItems(menus);
};
