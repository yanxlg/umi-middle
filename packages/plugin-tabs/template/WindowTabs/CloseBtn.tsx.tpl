/*
 * @author: yanxianliang
 * @date: 2024-01-19 11:11
 * @desc: $Desc$
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import React from 'react';
{{#useYhDesign}}
import { MenuProps, YHButton as Button, YHDropdown as Dropdown } from "@yh/yh-design";
{{/useYhDesign}}
{{^useYhDesign}}
import { MenuProps, Button, Dropdown } from "antd";
{{/useYhDesign}}
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import styled from 'styled-components';


const CloseIconButton = styled(CloseOutlined)`
  width: 20px;
  height: 20px;
  background: #ced2d880;
  border-radius: 4px;
  padding: 0;
  text-align: center;
  line-height: 20px;
  justify-content: center;
  cursor: pointer;
  &:hover {
    color: #3C7AF7;
  }
`;

const Container = styled.div`
  padding: 0px 12px;
  position: relative;
  &:before{
    content: '';
    position: absolute;
    width: 1px;
    height: 20px;
    left: 0px;
    background: #CED2D8;
    top: 50%;
    margin-top: -10px;
  }
`;

const CloseBtn = ({closeOthers, closeAll}: { closeOthers: () => void; closeAll: () => void; }) => {
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: '关闭其他页签',
      onClick: closeOthers
    },
    {
      key: '2',
      label: '关闭全部页签',
      onClick: closeAll
    },
  ];
  return (
    <Container>
      <Dropdown menu={ {items} } placement="bottomRight">
        <CloseIconButton/>
      </Dropdown>
    </Container>
  )
}

export {CloseBtn};
