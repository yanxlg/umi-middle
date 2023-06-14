{{#appFilePath}}
import { init } from "@yh/yh-sauron";

const { sauron } = require('{{{appFilePath}}}');

if(sauron){
  const {captureException, ...config} = sauron();
  // 初始化
  init({
    ...config,
    captureException: captureException ? captureException === true ? {
      ignoreErrors: {{{ignoreErrors}}}
    }: {
      ignoreErrors: {{{ignoreErrors}}},
      ...captureException
    }: false,
  });
}

{{/appFilePath}}
