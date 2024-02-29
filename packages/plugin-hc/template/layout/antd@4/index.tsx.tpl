/*
 * @author: yanxianliang
 * @date: 2024-01-06 14:13
 * @desc: 布局
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import React, {useMemo} from 'react';
import {Outlet} from 'umi';
import {Container} from './components/Container';
import {Content} from './components/Content';
import Header from './components/Header';
import Sider from './components/Sider';
import SignIn from './components/SignIn';
import {useAppData} from 'umi';
import { MenuItem } from '@@/plugin-hc/useMenu';
import { Layout as BasicLayout } from 'antd';
{{#useTabs}}
import { WindowTabs } from 'umi';
{{/useTabs}}


const root = document.documentElement;
const isInMicro = window.__POWERED_BY_QIANKUN__;
const symbol = Symbol.for('YH_DOS_SPA_MENU_UNIFY');
const isInYhDos = window[symbol];


type LayoutProps = {
  menuBadge?: { [key: string]: number };
  siderMinWidth:number;
  siderMaxWidth: number;
  contentPadding: number;
  headerHeight: number;
  patchClientMenus?: (menus: MenuItem[])=> MenuItem[];
}

function Layout({menuBadge, siderMinWidth, siderMaxWidth, contentPadding, headerHeight, patchClientMenus}: LayoutProps) {
  const onCollapse = (collapse: boolean, width: number) => {
    root.style.setProperty('--sider-width', `${width}px`);
    root.style.setProperty('--content-fixed-left', `${width + contentPadding}px`);
  };

  return (
    <>
      {!isInMicro && <Header/>}
      <Container headerHeight={headerHeight}>
        {!isInYhDos && (
          <Sider
            sizes={ {min: siderMinWidth, max: siderMaxWidth} }
            countMap={menuBadge}
            onCollapse={onCollapse}
            patchClientMenus={patchClientMenus}
            headerHeight={headerHeight}
          />
        )}
        <BasicLayout>
           {{#useTabs}}
            <WindowTabs badgeMap={menuBadge} />
            {{/useTabs}}
            <Content padding={contentPadding}>
              <Outlet/>
            </Content>
        </BasicLayout>
      </Container>
    </>
  );
}

function GlobalLayout() {
  const {pluginManager} = useAppData();
  const {layoutWrapper, ...config} = useMemo(() => {
    const config = pluginManager.applyPlugins({
      key: 'hcLayout',
      type: 'modify',
      initialValue: {
        siderMinWidth: 48,
        siderMaxWidth: 208,
        contentPadding: 16,
        headerHeight: 64
      },
    });
    root.style.setProperty('--sider-width', `${config.siderMaxWidth}px`);
    root.style.setProperty('--content-padding', `${config.contentPadding}px`);
    root.style.setProperty('--content-fixed-left', `${config.siderMaxWidth + config.contentPadding}px`);
    root.style.setProperty('--content-fixed-right', `${config.contentPadding}px`);
    return config;
  }, []);

  {{#isDevelopment}}
  if (window.location.pathname === '/signin') {
    return <SignIn/>;
  }
  {{/isDevelopment}}

  const layoutNode = <Layout {...config}/>;
  if(layoutWrapper){
    return React.createElement(layoutWrapper, {}, layoutNode);
  }
  return layoutNode;
}

export default GlobalLayout;
