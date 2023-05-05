export default () => {
  return {
    plugins: [
      require.resolve("@middle/plugin-watermark"),
      require.resolve("@middle/plugin-tabs"),
      require.resolve("@middle/plugin-asset"),
    ],
  };
};
