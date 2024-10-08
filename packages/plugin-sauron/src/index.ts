import fs from "fs";
import {join} from "path";
import type {IApi} from "umi";
import {winPath} from "umi/plugin-utils";
import {defaultErrorFilters} from "@middle-cli/plugin-sentry";
import {RUNTIME_TYPE_FILE_NAME} from "umi";

export function withTmpPath(opts: { api: IApi; path: string; noPluginDir?: boolean }) {
  return winPath(join(opts.api.paths.absTmpPath, opts.api.plugin.key && !opts.noPluginDir ? `plugin-${opts.api.plugin.key}` : "", opts.path));
}

const extensions = ['.ts', '.tsx', '.js', '.jsx'];

function getAppFilePath() {
  const hasAppFilePath = join(process.cwd(), "src", "app");
  for (let i = 0; i < extensions.length; i++) {
    const filePath = hasAppFilePath + extensions[i];
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
}

function hasRuntimeConfig(filePath: string) {
  const fileContent = fs.readFileSync(filePath, {encoding: "utf-8"}).replace(/\s/g,'');
  return /sauron\(.*\){/g.test(fileContent) || /sauron:\(.*\)=>{/g.test(fileContent) || /sauron=\(.*\)(:\S+)?=>{/g.test(fileContent);
}

export default (api: IApi) => {
  // 定义配置属性和值类型
  api.describe({
    key: "sauron",
    config: {
      schema({zod}) {
        return zod.object({});
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles
    },
    enableBy: api.EnableBy.register
  });

  // 生成临时文件并写入配置信息
  const tmpDir = winPath(__dirname);
  api.onGenerateFiles(() => {

    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
import type { InitParamsType } from '@yh/yh-sauron';
export interface IRuntimeConfig {
  sauron?: ()=>InitParamsType
}
      `,
    });

    // 项目是否有app.ts 文件
    const hasAppFilePath = getAppFilePath();
    // 同步sentry配置
    const ignoreErrors = api.config.sentry?.ignore || defaultErrorFilters;
    // ast 检测有没有导出sauron
    const runtimeConfig = hasAppFilePath ? hasRuntimeConfig(hasAppFilePath) : false;

    const isProduction = process.env.NODE_ENV === "production";

    api.writeTmpFile({
      path: "runtime.tsx",
      tplPath: join(tmpDir, "runtime.tsx.tpl"),
      context: {
        appFilePath: runtimeConfig ? hasAppFilePath : undefined,
        ignoreErrors: JSON.stringify(ignoreErrors),
        isDev: !isProduction
      }
    });
  });

  // 运行时配置
  api.addRuntimePluginKey(() => ["sauron"]);
  api.addRuntimePlugin({
    fn: () => withTmpPath({api, path: "runtime.tsx"}),
    stage: -1 * Number.MAX_SAFE_INTEGER
  });
};
