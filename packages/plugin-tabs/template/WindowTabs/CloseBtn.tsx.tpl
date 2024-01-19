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


const CloseIconButton = styled(Button)`
  width: 20px;
  height: 20px;
  background: #ced2d880;
  border-radius: 4px;
  padding: 0;
  text-align: center;
  line-height: 20px;
  &:hover {
    color: #3C7AF7;
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
    <Dropdown menu={{items}} placement="bottomRight">
      <CloseIconButton><CloseOutlined/></CloseIconButton>
    </Dropdown>
  )
}

export {CloseBtn};
