import { init } from "@yh/yh-sauron";
import { InjectEnvs } from 'umi';
//import * as RuntimeConfig from '/Users/yanxianliang/Desktop/yonghui/umi-middle/src/app.tsx';

//if(RuntimeConfig && RuntimeConfig.sauron){

//}
//const sauronConfig = RuntimeConfig.sauron(); // 注册自定义埋点
init({
  app_name: "{{{appName}}}",
  project_name: "{{{projectName}}}",
  env: InjectEnvs?.sauron_environment || 'dev',
  debug: {{{debug}}},
  useWebPerformance: {{{useWebPerformance}}},
  webPerformanceRouteList: {{{webPerformanceRouteList}}},
  useListenException: {{{useListenException}}},
  useListenAndSendSlowRequest: {{{useListenAndSendSlowRequest}}},
  useListenPageView: {{{useListenPageView}}},
  useListenRequestDuration: {{{useListenRequestDuration}}},
  useListenInterfaceException: {{{useListenInterfaceException}}},
  useAutoListenSendBlock: {{{useAutoListenSendBlock}}},
  useAutoListenAndSendClick: {{{useAutoListenAndSendClick}}}
});
