import { dirname } from 'path';
import { IApi } from "umi";

export default (api: IApi) => {
  api.describe({
    key: 'clickToComponentPro',
    enableBy: api.env === 'development' ? api.EnableBy.register : () => false,
  });

  const pkgPath = dirname(require.resolve('click-to-react-component-2'));
  api.modifyConfig((memo) => { // 强制修改click-to-component 中的alias
    memo.alias['click-to-react-component'] = pkgPath;
    return memo;
  });

  api.modifyAppData((memo) => {// 强制修改版本
    memo.clickToComponent = {
      pkgPath,
      version: '1.0.11',
    };
    return memo;
  });
};
