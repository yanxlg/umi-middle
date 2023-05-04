import { run } from "umi";

run({
  presets: [
    require.resolve("@umijs/max/dist/preset"), // preset 默认是max的preset
    require.resolve("./middle-preset"),
  ],
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
