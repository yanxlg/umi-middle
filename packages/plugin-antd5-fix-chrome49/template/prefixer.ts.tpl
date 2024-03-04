/**
 * autoprefixer 处理样式兼容
 * 需要兼容postcss 和 styled-components
 * styled-components 会自动转 clip-path
 */

const hacks = ['clipPath'];

const prefixes = ['-webkit-', '-moz-'];

const transform = (options) => {
  const visit = (cssObj) => {
    const clone = { ...cssObj };
    Object.keys(cssObj).forEach(key=>{
      if (hacks.indexOf(key) > -1) {
        prefixes.forEach(prefix=>{
          clone[`${prefix}${key}`] = cssObj[key];
        })
      }
    })
    return clone;
  };

  return { visit };
};

export default transform();
