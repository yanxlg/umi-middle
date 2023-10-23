import {join} from 'path';
function hasModule(name: string){
  try {
    require.resolve(name);
    return true;
  }catch (e) {
    return false;
  }
}

export default ()=>{
  // 如果只有yh-design, 没有antd则需要使用插件
  const hasYhDesign = hasModule('@yh/yh-design');
  const hasAntd = hasModule('antd');

  return {
    plugins: [
      require('react-activation/babel'),
      require("./babel"),
      ...hasYhDesign && !hasAntd?[[require("./babel-plugin-import"),{
        "libraryName": "antd",
        "style": true,
        "customName": (name: string) => {
          return `@yh/yh-design/lib/YH${name}`;
        },
        "customComponentName": (name: string)=>{
          return `YH${name}`;
        },
        "include": [join(__dirname,'../')]
      }]]:[],
    ],
  }
}
