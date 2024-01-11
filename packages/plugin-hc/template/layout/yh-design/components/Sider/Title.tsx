/*
 * @author: yanxianliang
 * @date: 2024-01-06 22:41
 * @desc: $Desc$
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import { YHTooltip as Tooltip } from '@yh/yh-design';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';

const TitleContainer = styled.div`
  position: relative;
  height: 48px;
  text-align: center;
  line-height: 24px;
  padding: 12px 16px 12px 28px;
  box-shadow: -5px 7px 13px -9px rgba(209, 213, 233, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  z-index: 2;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  .wos-layout-sider-collapsed & {
    padding-left: 10px;
    font-size: 14px;
  }
`;

export const Title = ({
  children,
  collapsed,
}: PropsWithChildren<{ collapsed: boolean }>) => {
  return (
    <TitleContainer>
      <Tooltip
        placement="right"
        title={children}
        open={collapsed ? undefined : false}
      >
        {children}
      </Tooltip>
    </TitleContainer>
  );
};
