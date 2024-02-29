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
import {MenuDataItem} from '@umijs/route-utils';
import {Badge, Layout} from 'antd';
import type {ItemType} from 'antd/lib/menu/hooks/useItems';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {history, useMenu, useLocation} from 'umi';
import {MenuSpin} from './MenuSpin';
import {Scroll} from './Scroll';
import {SiderContent} from './SiderContent';
import {Title} from './Title';
import {conversionPath, fillClientMenus, isUrl} from './utils';
import {MenuItem} from '@@/plugin-hc/useMenu';
import {matchPath} from 'react-router-dom';
import {MenuLabel} from './MenuLabel';
import {StyledMenu} from './StyledMenu';
import {IconWithBadge} from './IconWithBadge';

function getIcon(icon?: string | React.ReactNode): React.ReactNode {
  switch (icon) {
    case 'bank':
      return <BankOutlined/>;
    case 'setting':
      return <SettingOutlined/>;
    case 'bar-chart':
      return <BarChartOutlined/>;
    case 'tool':
      return <ToolOutlined/>;
    case 'download':
      return <DownloadOutlined/>;
  }

  return icon;
}





function getNavMenuItems(
  menusData: MenuDataItem[] = [],
  isChildren: boolean,
  collapsed?: boolean,
  countMap?: { [key: string]: number },
): ItemType[] {
  return menusData.map((item) => {
    const {icon, title, url, key, children} = item;
    const iconNode = isChildren ? null : getIcon(icon);
    const menuKey = key || url;
    const count = countMap?.[menuKey];


    // 第一级放在icon, 子菜单放在Label上？？？

    if (Array.isArray(children) && children.length > 0) {
      return {
        key: menuKey,
        icon: iconNode && collapsed?<IconWithBadge iconNode={iconNode} count={count}/>:iconNode,
        children: getNavMenuItems(item.children, true, collapsed, countMap),
        label: <MenuLabel label={title} collapsed={collapsed} badge={count}/>,
      };
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

    return {
      label: <MenuLabel label={title} badge={count} collapsed={collapsed} tooltip={true}/>,
      key: menuKey,
      icon: iconNode && collapsed?<IconWithBadge iconNode={iconNode} count={count}/>:iconNode,
      onClick: onClick,
    };
  });
}


function matchMenuWithKey(menu: MenuDataItem, key: string) {
  const path = menu.key || menu.path || menu.url;
  if (path) {
    const result = matchPath({
      path: path
    }, key);
    return result;
  }
  return null;
}

// 菜单可能没有完全按照层级配置
function matchActiveMenu(menus: MenuDataItem[], activeKey?: string, parentKeys?: string[]): {activeMenu: MenuDataItem;parentMenuKeys:string[]}|undefined {
  if (!activeKey) {
    return undefined;
  }
  // 层级递归
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i];
    if (matchMenuWithKey(menu, activeKey)) { // 命中了菜单
      return {
        activeMenu: menu,
        parentMenuKeys: parentKeys||[],
      }
    }
    const children = menu.children;
    if (children && children.length > 0) {
      const matchResult = matchActiveMenu(children, activeKey, [...parentKeys||[],menu.key!]);
      if(matchResult){
        return matchResult;
      }
    }
  }
}

function isKeyListEqual(prev?: string[], next?: string[]){
  if(!prev && !next){
    return true
  }
  if((!prev && !!next) || (!!prev && !next)){
    return false;
  }

  return prev.sort().join(',') === next.sort().join(',');
}


const Sider = (
  {
    countMap,
    sizes = {min: 48, max: 208},
    onCollapse,
    patchClientMenus,
    headerHeight,
  }: {
    countMap?: { [key: string]: number };
    sizes?: { min: number; max: number };
    onCollapse?: (collapsed: boolean, width: number) => void;
    patchClientMenus?: (menus: MenuItem[]) => MenuItem[];
    headerHeight: number;
  }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {loading, menus} = useMenu('work-order');
  const location = useLocation();

  const withStaticMenus = useMemo(() => {
    if (menus.length > 0) {
      return fillClientMenus(patchClientMenus ? patchClientMenus(menus) : menus); // 转换类型
    }
    return [];
  }, [menus]);


  const mountMatch = useMemo(() => {
    return  matchActiveMenu(withStaticMenus, location.pathname || '/');
  }, [location.pathname, withStaticMenus]);

  const activeMenu = mountMatch?.activeMenu;
  const parentOpenKeys = mountMatch?.parentMenuKeys;

  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(
    activeMenu ? [activeMenu.key!] : [],
  );

  const openKeysRef = useRef<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>(parentOpenKeys||[]);

  useEffect(() => {
    const activeMenuKey = activeMenu?.key;
    if (activeMenuKey) {
      // 找到匹配的了
      setSelectedKeys([activeMenuKey]);
    }

    if(!isKeyListEqual(openKeys,parentOpenKeys) && parentOpenKeys){
      if(window.requestIdleCallback) {
        window.requestIdleCallback(()=>{
          setOpenKeys(parentOpenKeys);
        })
      }else if(window.requestAnimationFrame){
        window.requestAnimationFrame(()=>{
          setOpenKeys(parentOpenKeys);
        })
      }else{
        setTimeout(()=>{
          setOpenKeys(parentOpenKeys);
        },0);
      }
    }
  }, [activeMenu?.key]);

  const onCollapseHandle = (collapse: boolean) => {
    setCollapsed(collapse);
    onCollapse?.(collapse, collapse ? sizes.min : sizes.max);
  };

  const onCollapseButtonClick = (collapse: boolean)=>{
    // 需要缓存
    onCollapseHandle(collapse);
    if(collapse){
      openKeysRef.current = openKeys;
    } else {
      setOpenKeys(openKeysRef.current);
    }
  }

  return (
    <Layout.Sider
      trigger={null}
      collapsible={true}
      collapsed={collapsed}
      onCollapse={onCollapseHandle}
      collapsedWidth={sizes.min}
      width={sizes.max}
      theme={'light'}
      style={ {height: `calc(100vh - ${headerHeight}px)`} }
    >
      <SiderContent>
        <Title collapsed={collapsed}>工单系统</Title>
        <Scroll>
          {loading && <MenuSpin/>}
          <StyledMenu
            mode={'inline'}
            theme={'light'}
            openKeys={collapsed?[]:openKeys}
            onOpenChange={setOpenKeys}
            selectedKeys={selectedKeys}
            onSelect={(info) => {
              setSelectedKeys(info.selectedKeys);
            }}
            items={getNavMenuItems(withStaticMenus, false, collapsed, countMap)}
          />
        </Scroll>
      </SiderContent>
      <CollapsedButton collapsed={collapsed} onCollapse={onCollapseButtonClick}/>
    </Layout.Sider>
  );
};

export default Sider;
