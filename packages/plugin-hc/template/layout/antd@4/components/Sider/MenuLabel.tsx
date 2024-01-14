/*
 * @author: yanxianliang
 * @date: 2024-01-13 19:33
 * @desc: 菜单文字渲染
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */

import styled from "styled-components";
import {Badge, Tooltip} from "antd";
import React from "react";

const LabelContainer = styled.div`
  display: flex;
`;

const Label = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;


export const MenuLabel = (
  {
    label,
    badge,
    tooltip,
    collapsed
  }: { label: string; badge?: number; tooltip?: boolean; collapsed?: boolean }) => {

  const content = (
    <LabelContainer>
      <Label>
        {label}
      </Label>
      {
        void 0 === badge ? null : (
          <Badge
            overflowCount={9999}
            count={badge}
            offset={[0,10]}
            style={{
              pointerEvents: 'none',
              background: 'rgba(255,77,79,0.9)'
            }}
          >
            <i/>
          </Badge>)
      }
    </LabelContainer>
  );
  if (tooltip) {
    return (
      <Tooltip
        placement="right"
        title={label}
        open={collapsed ? false : undefined}
      >
        {content}
      </Tooltip>
    )
  }
  return content;
}
