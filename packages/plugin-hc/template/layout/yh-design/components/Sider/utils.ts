/*
 * @author: yanxianliang
 * @date: 2024-01-06 23:05
 * @desc: Desc
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
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
  return toMenuDataItems(menus);
};
