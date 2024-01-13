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
  & .{{{antPrefix}}}-menu-title-content {
    overflow: auto;
    text-overflow: unset;
  }
`;
