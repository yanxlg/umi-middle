/*
 * @author: yanxianliang
 * @date: 2024-01-06 20:05
 * @desc: $Desc$
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import { Layout } from 'antd';
import { PropsWithChildren } from 'react';

// 微前端支持基座传入header高度
export const Container = ({ children, headerHeight }: PropsWithChildren<{headerHeight:number}>) => {
  return (
    <Layout
      style={{ width: '100%', height: `calc(100vh - ${headerHeight}px)` }}
    >
      {children}
    </Layout>
  );
};
