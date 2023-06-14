{{#appFilePath}}
import { init } from "@yh/yh-sauron";

const { sauron } = require('{{{appFilePath}}}');

if(sauron){
  const config = sauron();
  // 初始化
  init(config);
}

{{/appFilePath}}
