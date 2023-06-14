import type {InitParamsType} from '@yh/yh-sauron';
import {WatermarkConfig} from "@@/plugin-watermark/types";
/**
 * 水印内容配置，登陆页面需要调用patchWatermarkConfig方法进行更新，当前配置仅用于从本地存储中获取水印内容等
 * import { patchWatermarkConfig } from 'umi';
 * patchWatermarkConfig({content:""})
 *
 **/
export const watermark = ():WatermarkConfig => {
  // const userName = localStorage.getItem("__userName__"); 可以从本地存储中获取水印内容
  return {
    content: "水印内容，需要替换",
  };
};


export const sauron = ():InitParamsType => {
  return {
    app_name: "test",
    env: 'dev',
    uid: localStorage.getItem("uid") || '',
    captureException: true,
    captureSlowRequest: true,
    captureRequestDuration: true,
    captureRequestException: {
      rules: [{
        pathRule: '*',
        successCodes: ['200000']
      }]
    },
    capturePageView: true,
    captureBlankPage: true,
  }
};
