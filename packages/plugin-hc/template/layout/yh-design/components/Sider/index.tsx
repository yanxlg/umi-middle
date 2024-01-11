/*
 * @author: yanxianliang
 * @date: 2024-01-06 14:46
 * @desc: Sider
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */

import CollapsedButton from '../CollapsedButton/index.tsx';
import {
  BankOutlined,
  BarChartOutlined,
  DownloadOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { getMatchMenu, MenuDataItem } from '@umijs/route-utils';
import { YHBadge as Badge, YHLayout as Layout, YHMenu as Menu, YHTooltip as Tooltip } from '@yh/yh-design';
import type { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useMemo, useState } from 'react';
import { history, useMenu, useLocation } from 'umi';
import { MenuSpin } from './MenuSpin';
import { Scroll } from './Scroll';
import { SiderContent } from './SiderContent';
import { Title } from './Title';
import { conversionPath, fillClientMenus, isUrl } from './utils';
import { MenuItem } from '@@/plugin-hc/useMenu';

function getIcon(icon?: string | React.ReactNode): React.ReactNode {
  switch (icon) {
    case 'bank':
      return <BankOutlined />;
    case 'setting':
      return <SettingOutlined />;
    case 'bar-chart':
      return <BarChartOutlined />;
    case 'tool':
      return <ToolOutlined />;
    case 'download':
      return <DownloadOutlined />;
  }

  return icon;
}

function getNavMenuItems(
  menusData: MenuDataItem[] = [],
  isChildren: boolean,
  collapsed?: boolean,
  countMap?: { [key: string]: number },
) {
  return menusData.map((item) => {
    const { icon, title, url, key, children } = item;
    const iconNode = isChildren ? null : getIcon(icon);
    const menuKey = key || url;
    const count = countMap?.[menuKey];

    if (Array.isArray(children) && children.length > 0) {
      const badgeTitle =
        void 0 !== count && !collapsed ? (
          <Badge
            overflowCount={9999}
            offset={[15, 0]}
            count={count}
            styles={{ root: { color: 'inherit' } }}
          >
            {title}
          </Badge>
        ) : (
          title
        );
      return (
        <Menu.SubMenu key={menuKey} icon={
          <>
            {void 0 !== count && iconNode && collapsed ? (
              <Badge
                overflowCount={9999}
                count={count}
                offset={[8, -15]}
                styles={{ root: { color: 'inherit' } }}
              >
                <span />
              </Badge>
            ) : undefined}
            {iconNode}
          </>
        } title={badgeTitle}>
          {getNavMenuItems(item.children, true, collapsed, countMap)}
        </Menu.SubMenu>
      )
    }

    const itemPath = conversionPath(url || '/');
    const isHttpUrl = isUrl(itemPath);

    const onClick = () => {
      if (url) {
        if (isHttpUrl) {
          window.open(url);
        } else {
          history.push(url);
        }
      }
    };

    const menuContent = (
      <Tooltip
        placement="right"
        title={title}
        visible={collapsed ? false : undefined}
      >
        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
          {title}
        </div>
      </Tooltip>
    );

    return (
      <Menu.Item title={void 0 !== count ? (
        <Badge
          overflowCount={9999}
          count={count}
          styles={{ root: { color: 'inherit' } }}
        >
          {menuContent}
        </Badge>
      ) : (
        menuContent
      )} key={menuKey} icon={iconNode} onClick={onClick}></Menu.Item>
    )
  });
}

const Sider = ({
  countMap,
  sizes = { min: 48, max: 208 },
  onCollapse,
  patchClientMenus,
}: {
  countMap?: { [key: string]: number };
  sizes?: { min: number; max: number };
  onCollapse?: (collapsed: boolean, width: number) => void;
  patchClientMenus?: (menus: MenuItem[])=> MenuItem[];
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { loading, menus } = useMenu('work-order');
  const location = useLocation();

  const withStaticMenus = useMemo(() => {
    if (menus.length > 0) {
      return fillClientMenus(patchClientMenus?patchClientMenus(menus):menus); // 转换类型
    }
    return [];
  }, [menus]);

  const matchMenus = useMemo(() => {
    return getMatchMenu(location.pathname || '/', withStaticMenus, true);
  }, [location.pathname, withStaticMenus]);

  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(
    matchMenus[0] ? [matchMenus[0].key!] : [],
  );

  const onCollapseHandle = (collapse: boolean) => {
    setCollapsed(collapse);
    onCollapse?.(collapse, collapse ? sizes.min : sizes.max);
  };

  return (
    <Layout.Sider
      trigger={null}
      collapsible={true}
      collapsed={collapsed}
      onCollapse={onCollapseHandle}
      collapsedWidth={sizes.min}
      width={sizes.max}
      theme={'light'}
    >
      <SiderContent>
        <Title collapsed={collapsed}>工单系统</Title>
        <Scroll>
          {loading && <MenuSpin />}
          <Menu
            mode={'inline'}
            theme={'light'}
            selectedKeys={selectedKeys}
            onSelect={(info) => {
              setSelectedKeys(info.selectedKeys);
            }}
          >
          {
            getNavMenuItems(withStaticMenus, false, collapsed, countMap)
          }
          </Menu>
        </Scroll>
      </SiderContent>
      <CollapsedButton collapsed={collapsed} setCollapsed={onCollapseHandle} />
    </Layout.Sider>
  );
};

export default Sider;
