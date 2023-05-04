import { run } from "umi";

run({
  presets: [
    require.resolve("@umijs/max/dist/preset"),
    require.resolve("./preset"),
  ], // preset 默认是max的preset
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
