/*
 * @author: yanxianliang
 * @date: 2024-01-06 20:02
 * @desc: $Desc$
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import { YHLayout as Layout } from '@yh/yh-design';
import styled from 'styled-components';
import React from "react";


type ContentType = (props:{padding: number}&Parameters<typeof Layout.Content>[0])=>React.ReactNode;

export const Content = styled<ContentType>(Layout.Content)`
  padding: ${(props)=>props.padding}px;
  flex: 1;
  flex-direction: column;
  overflow: auto;
  position: relative;
`;
