{{#appFilePath}}
import { init } from "@yh/yh-sauron";
import { InjectEnvs } from 'umi';
const { sauron } = require('{{{appFilePath}}}');

if(sauron){
  const {captureException, debug, ...config} = sauron();
  // 初始化
  init({
    ...config,
    env: InjectEnvs?.sauron_environment??"dev",
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
