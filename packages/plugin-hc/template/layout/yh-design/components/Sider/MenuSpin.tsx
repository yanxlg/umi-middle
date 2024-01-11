/*
 * @author: yanxianliang
 * @date: 2024-01-06 22:40
 * @desc: $Desc$
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */

import { YHSpin as Spin } from '@yh/yh-design';
import styled from 'styled-components';

const SpinContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MenuSpin = () => {
  return (
    <SpinContainer>
      <Spin spinning={true} />
    </SpinContainer>
  );
};
