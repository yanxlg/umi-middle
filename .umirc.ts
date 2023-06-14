import {defineConfig} from '@umijs/max';

export default defineConfig({
  clickToComponent: {},
  deadCode: {},
  mfsu: false,
  // mfsu: {esbuild: true},
  esbuildMinifyIIFE: true,
  tabs: true, // 从umi中导出 WindowTabs，将其渲染到需要的位置并配置相关主题样式即可
  watermark: {},
  antd: {},
  mock: false,
  sentry: {
    project: 'test-de',
    authToken: '1edc94add1d543d793551bea82d04a2e486ff1182f7441d3b9ec7c2223860f3f',
    dsn: 'https://5666cb429d8b47b79f4c44de90c029fb@sentry.yonghuivip.com/213',
  },
  verifyCommit: {
    scope: ['feat', 'fix'],
    allowEmoji: true,
  },
  injectEnv: { // 注入环境变量，需要在部署工作台配置对应的环境变量后才能正常部署
    sentry_environment: "local", // 注入环境变量，需要在部署工作台配置，此处值作为开发默认值使用
    sauron_environment: "dev"
  },
  sauron: {
    // appName: 'test',// 如果想要多个前端共用一个索伦项目，可通过该字段进行区分
    // projectName: 'yh_life', // 索伦平台项目编码
    // debug: process.env.NODE_ENV !== "production",
    // useListenPageView: true,
    // useListenRequestDuration: true,
    // useListenException: true,
    // useListenInterfaceException: {
    //   rules: [{
    //     pathRule: '*',
    //     successCodes: ['200000']
    //   }]
    // }
  }
});
