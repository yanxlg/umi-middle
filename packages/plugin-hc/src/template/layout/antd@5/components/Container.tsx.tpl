/*
 * @author: yanxianliang
 * @date: 2024-01-06 20:05
 * @desc: $Desc$
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import getSlaveProps from '@@/plugin-qiankun-slave/qiankunModel';
import { Layout } from 'antd';
import { PropsWithChildren } from 'react';

// 微前端支持基座传入header高度
export const Container = ({ children }: PropsWithChildren) => {
  const slaveProps = getSlaveProps();
  const headerHeight = slaveProps?.headerHeight ?? 64;
  return (
    <Layout
      style={{ width: '100vw', height: `calc(100vh - ${headerHeight}px)` }}
    >
      {children}
    </Layout>
  );
};
