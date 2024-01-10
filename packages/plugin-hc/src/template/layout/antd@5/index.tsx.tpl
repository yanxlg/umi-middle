/*
 * @author: yanxianliang
 * @date: 2024-01-06 14:13
 * @desc: 布局
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import { isInMicro } from '@/configs/isInMicro';
import { isInYhDos } from '@/configs/isInYhdos';
import { isSignInPage } from '@/configs/isSignInPage';
import { default as menuBadgeState, MenuBadgeState } from '@/models/menu.badge';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { Outlet, updateHtmlCssProperties } from 'umi';
import { Container } from './components/Container';
import { Content } from './components/Content';
import Header from './components/Header';
import Sider from './components/Sider';
import SignIn from './components/SignIn';
import { useAppData } from 'umi';

// yhdos 中菜单直接不要，统计数字也不需要，但websocket需要
const Layout = observer(
  ({ menuBadge = menuBadgeState }: { menuBadge?: MenuBadgeState }) => {
    const countMap = menuBadge.countMap;
    const { pluginManager } = useAppData();
    const runtimeConfig = pluginManager.applyPlugins({
      key: 'hcLayout',
      type: 'modify',
      initialValue: {
        siderMenuMin: 48,
        siderMenuMax: 208,
        contentBoxPadding: 16
      },
    });

    useEffect(() => {
      if (!isInYhDos) {
        menuBadge.run();
      }
      return () => {
        if (!isInYhDos) {
          menuBadge.stop();
        }
      };
    }, []);

    const onCollapse = (collapse: boolean, width: number) => {
      updateHtmlCssProperties({
        '--sider-width': `${width}px`,
        '--content-fixed-left': `${width + runtimeConfig.contentBoxPadding}px`,
      });
    };

    return (
      <>
        {!isInMicro && <Header />}
        <Container>
          {!isInYhDos && (
            <Sider
              sizes={{ min: runtimeConfig.siderMenuMin, max: runtimeConfig.siderMenuMax }}
              countMap={toJS(countMap)}
              onCollapse={onCollapse}
            />
          )}
          <Content padding={runtimeConfig.contentBoxPadding}>
            <Outlet />
          </Content>
        </Container>
      </>
    );
  },
);

function withSignIn(Layout: React.FC) {
  return () => {
    if (isSignInPage) {
      return <SignIn />;
    }
    return <Layout />;
  };
}

export default withSignIn(Layout);
