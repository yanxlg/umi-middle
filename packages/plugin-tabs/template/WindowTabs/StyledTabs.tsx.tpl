/*
 * @author: yanxianliang
 * @date: 2024-01-18 18:53
 * @desc: $Desc$
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
{{#useYhDesign}}
import { YHTabs as Tabs } from "@yh/yh-design";
{{/useYhDesign}}
{{^useYhDesign}}
import { Tabs } from "antd";
{{/useYhDesign}}
import styled from 'styled-components';


export const StyledTabs = styled(Tabs)`
  &.{{{antdPrefix}}}-tabs {
    background: #E7E8EB;
    box-shadow: 0 10px 38px -6px #e7e9f23d;
    padding-top: 4px;
  }


  &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-nav-list .{{{antdPrefix}}}-tabs-tab{
    border-radius: 2px 2px 0 0; // 怎么强制呢
    background-color: #E7E8EB;
    border: 0;
    padding: 9px 17px;

    &.{{{antdPrefix}}}-tabs-tab-active {
      background-color: #FFF
    }

    &.{{{antdPrefix}}}-tabs-tab-active .{{{antdPrefix}}}-tabs-tab-btn{
      text-shadow: 0 0 0.5px currentcolor;
    }

    &.{{{antdPrefix}}}-tabs-tab-active:before, &.{{{antdPrefix}}}-tabs-tab-active:after{
      display: none;
    }

    &.{{{antdPrefix}}}-tabs-tab-active + .{{{antdPrefix}}}-tabs-tab::before{
      display: none;
    }

    &:before{
      content: '';
      position: absolute;
      width: 1px;
      height: 20px;
      left: -0.5px;
      z-index: 2;
      background: #CED2D8;
      top: 50%;
      margin-top: -10px;
    }

    &:first-of-type::before{
      display: none;
    }
  }
  &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab.{{{antdPrefix}}}-tabs-tab-active .{{{antdPrefix}}}-tabs-tab-btn {
    color: #000000;
    font-weight: 500;
  }
  &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab:hover,&.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab:active, &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab-btn:active {
    background: #CED2D8;
    color: #000000;
  }
  &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab-remove {
    width: 18px;

    height: 18px;
    text-align: center;
    line-height: 18px;
    padding: 0;
    border-radius: 4px;
  }
  &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab-remove:hover {
    background: #AAAFB9;
    color: rgba(0, 0, 0, 0.45);
  }

  &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab-btn:focus:not(:focus-visible),
  &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab-remove:focus:not(:focus-visible),
  &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab-btn:active,
  &.{{{antdPrefix}}}-tabs >.{{{antdPrefix}}}-tabs-nav .{{{antdPrefix}}}-tabs-tab-remove:active {
    color: #000000;
  }
`;
