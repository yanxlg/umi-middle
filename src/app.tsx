// 运行时配置





/**
 * 水印内容配置，登陆页面需要调用patchWatermarkConfig方法进行更新，当前配置仅用于从本地存储中获取水印内容等
 * import { patchWatermarkConfig } from 'umi';
 * patchWatermarkConfig({content:""})
 *
 **/
export const watermark = () => {
  // const userName = localStorage.getItem("__userName__"); 可以从本地存储中获取水印内容
  return {
    content: "水印内容，需要替换",
  };
};



