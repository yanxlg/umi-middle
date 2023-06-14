{{#appFilePath}}
import { init } from "@yh/yh-sauron";

const { sauron } = require('{{{appFilePath}}}');

if(sauron){
  const {captureException, debug, ...config} = sauron();
  // 初始化
  init({
    ...config,
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
