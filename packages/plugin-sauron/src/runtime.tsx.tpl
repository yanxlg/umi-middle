{{#appFilePath}}
import Sauron from "@yh/yh-sauron";
import { getInjectEnv } from 'umi';
const { sauron } = require('{{{appFilePath}}}');

if(sauron){
  const {captureException, debug, ...config} = sauron();
  // 初始化
  Sauron.init({
    ...config,
    env: getInjectEnv?.('sauron_environment')??"dev", // 环境，全局配置
    debug: debug??{{{isDev}}},
    captureException: captureException ? captureException === true ? {
      ignoreErrors: {{{ignoreErrors}}}
    }: {
      ignoreErrors: {{{ignoreErrors}}},
      ...captureException
    }: false,
  });
}

{{/appFilePath}}
