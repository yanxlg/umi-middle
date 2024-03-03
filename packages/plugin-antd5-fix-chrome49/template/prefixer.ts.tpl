/**
 * autoprefixer 处理样式兼容
 */
import { prefix } from 'inline-style-prefixer';

const transform = (options: Options = {}) => {

  const visit = (cssObj) => {
    const clone = prefix({ ...cssObj });
    return clone;
  };

  return { visit };
};

export default transform;
