{{#styleProvider}}
{{#styleProvider.legacyTransformer}}
import { legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs';
{{/styleProvider.legacyTransformer}}
import StyleContext from '@ant-design/cssinjs/es/StyleContext';
{{/styleProvider}}
import './global.less';

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

{{#styleProvider}}
// 兼容message 等组件where 样式降级
if (
  StyleContext &&
  StyleContext._currentValue &&
  StyleContext._currentValue.hashPriority
) {
  StyleContext._currentValue.hashPriority = '{{styleProvider.hashPriority}}';
  if({{styleProvider.legacyTransformer}}){
    StyleContext._currentValue.transformers = [
      legacyLogicalPropertiesTransformer,
    ];
  }
}
{{/styleProvider}}


// 样式强制修复
// 兼容chrome49 或低版本 日期组件：input ==> outline: 0;
