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
  background: #E7E8EB;
  box-shadow: 0 10px 38px -6px #e7e9f23d;
  padding-top: 4px;

  //& >.wos-tabs-nav .wos-tabs-tab{
  //  border-radius: 0; // 怎么强制呢
  //}
`;
