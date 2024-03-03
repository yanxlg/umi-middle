/**
 * autoprefixer 处理样式兼容
 */

 const hacks = ['clip-path'];

const transform = (options) => {

  const visit = (cssObj) => {
    const clone = { ...cssObj };
    Object.entries(cssObj).forEach(function (entry) {
      const [key, value] = entry;
      if (typeof key === 'string' && hacks.indexOf(key) > -1) {
        clone[`-webkit-${key}`] = value;
        clone[`-moz-${key}`] = value;
      }
    });
    return clone;
  };

  return { visit };
};

export default transform();
