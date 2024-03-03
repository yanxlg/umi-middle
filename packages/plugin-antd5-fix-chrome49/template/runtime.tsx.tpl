import {
  StyleProvider,
  legacyLogicalPropertiesTransformer
} from '@ant-design/cssinjs';
import StyleContext from '@ant-design/cssinjs/es/StyleContext';
// 样式强制兼容优化
import './global.less';
import React from 'react';
import prefixer from './prefixer';
import { StyleSheetManager } from 'styled-components';

// fix rc-trigger 在chrome49 上异常
const originGetBoundingClientRect = Element.prototype.getBoundingClientRect;
if (originGetBoundingClientRect) {
  Element.prototype.getBoundingClientRect = function () {
    const rect = originGetBoundingClientRect.call(this);
    const { x, left, y, top } = rect;
    rect.x = x || left;
    rect.y = y || top;
    return rect;
  };
}

// 兼容message 等组件where 样式降级
if (
  StyleContext &&
  StyleContext._currentValue &&
  StyleContext._currentValue.hashPriority
) {
  StyleContext._currentValue.hashPriority = '{{styleProvider.hashPriority}}';
  StyleContext._currentValue.transformers = [
    legacyLogicalPropertiesTransformer,
    prefixer
  ];
}

export function rootContainer(container: React.ReactNode) {
  return (
    <StyleProvider
      hashPriority='{{styleProvider.hashPriority}}'
      transformers={
        [
          legacyLogicalPropertiesTransformer,
          prefixer
        ]
      }
    >
     <StyleSheetManager disableCSSOMInjection enableVendorPrefixes>
      {container}
     </StyleSheetManager>
    </StyleProvider>
  );
}

