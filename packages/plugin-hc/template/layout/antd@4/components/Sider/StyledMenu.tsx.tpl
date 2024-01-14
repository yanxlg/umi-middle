/*
 * @author: yanxianliang
 * @date: 2024-01-13 20:12
 * @desc: 菜单样式控制
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */

import {Menu} from 'antd';
import styled from "styled-components";

export const StyledMenu = styled(Menu)`
  &.{{{antPrefix}}}-menu-root .{{{antPrefix}}}-menu-submenu .{{{antPrefix}}}-menu-submenu-title > .{{{antPrefix}}}-menu-title-content,
  &.{{{antPrefix}}}-menu-root .{{{antPrefix}}}-menu.{{{antPrefix}}}-menu-sub > .{{{antPrefix}}}-menu-item .{{{antPrefix}}}-menu-submenu-title > .{{{antPrefix}}}-menu-title-content,
  &.{{{antPrefix}}}-menu-inline.{{{antPrefix}}}-menu-root .{{{antPrefix}}}-menu-item >.{{{antPrefix}}}-menu-title-content{
    overflow: visible;
    text-overflow: unset;
  }

  &.wos-menu-inline-collapsed.wos-menu-root .wos-menu-submenu-title {
    display: flex;
    align-items: center;
  }
`;
