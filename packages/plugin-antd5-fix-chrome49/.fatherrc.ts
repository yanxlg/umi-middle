import { defineConfig } from "father";

export default defineConfig({
  extends: "../../.fatherrc.ts",
  esm: {
    output: 'esm',
    platform: 'browser',
    input: 'simple'
  }
});
