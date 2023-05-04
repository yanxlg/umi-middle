/*
 * @Author: yanxlg
 * @Date: 2023-04-25 22:01:35
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-28 01:19:56
 * @Description: 水印布局文件
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import React, { PropsWithChildren, useState, useMemo, useEffect } from "react";
import { history, matchRoutes, useAppData } from "umi";
import "./Container.less";
import WaterMark from "./Watermark";
import type { WatermarkConfig } from './types.d.ts';
import { useModel } from "@@/plugin-model";

let globalWatermarkConfig: WatermarkConfig = {};
let onRuntimeConfigChange = ()=>{};

export function patchWatermarkConfig(watermark: WatermarkConfig){
  globalWatermarkConfig = { ...globalWatermarkConfig, ...watermark };
  onRuntimeConfigChange();
}

const base = "{{{base}}}";

function getRelativePath(pathname: string) {
  if(pathname.indexOf(base) === 0){
    const next = pathname.replace(base,'');
    return /^\//.test(next) ? next : `/${next}`;
  }
  return pathname
}

export default (props: PropsWithChildren<any>) => {
  const { pluginManager, clientRoutes } = useAppData();

  const route = useMemo(()=>{
    return matchRoutes(clientRoutes, getRelativePath(location.pathname))?.pop?.()?.route;
  },[]);

  const [disableWatermark, setDisableWatermark] = useState(route?.watermark === false);

  useEffect(() => { 
    history.listen((update) => { 
      setDisableWatermark(matchRoutes(clientRoutes, getRelativePath(update.location.pathname))?.pop?.()?.route?.watermark === false);
    });
  }, []);

  const [ scopeConfig, setScopeConfig ] = useState<WatermarkConfig>(globalWatermarkConfig);
  
  useMemo(()=>{
    // 添加事件
    onRuntimeConfigChange = ()=>{
       setScopeConfig(globalWatermarkConfig);
    }
  },[]);

  const initialInfo = (useModel && useModel("@@initialState")) || {
    initialState: undefined,
    setInitialState: null,
  };
  const userConfig = {{{userConfig}}};// 传入参数
  const runtimeConfig = pluginManager.applyPlugins({
    key: "watermark",
    type: "modify",
    initialValue: {
      ...initialInfo,
    },
  });

  return (
    <WaterMark {...userConfig} {...runtimeConfig} {...scopeConfig} {...disableWatermark?{content:undefined}:{}} className="watermark-layout">
      {props.children}
    </WaterMark>
  )
};
