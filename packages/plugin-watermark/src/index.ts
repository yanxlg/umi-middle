/*
 * @Author: yanxlg
 * @Date: 2023-04-25 09:23:46
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-28 01:18:28
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import * as fs from "fs";
import { join } from "path";
import { IApi, RUNTIME_TYPE_FILE_NAME } from "umi";
import { Mustache, winPath } from "umi/plugin-utils";

// 生成的模版文件地址。
export function withTmpPath(opts: {
  api: IApi;
  path: string;
  noPluginDir?: boolean;
}) {
  return winPath(
    join(
      opts.api.paths.absTmpPath,
      opts.api.plugin.key && !opts.noPluginDir
        ? `plugin-${opts.api.plugin.key}`
        : "",
      opts.path
    )
  );
}

export default (api: IApi) => {
  // See https://umijs.org/docs/guides/plugins
  api.describe({
    key: "watermark",
    config: {
      schema({ zod }) {
        return zod.object({
          gapX: zod.number().optional(),
          /** 水印之间的垂直间距 */
          gapY: zod.number().optional(),
          /** 追加的水印元素的z-index */
          zIndex: zod.number().optional(),
          /** 水印的宽度 */
          width: zod.number().optional(),
          /** 水印的高度 */
          height: zod.number().optional(),
          /** 水印在canvas 画布上绘制的垂直偏移量，正常情况下，水印绘制在中间位置, 即 offsetTop = gapY / 2 */
          offsetTop: zod.number().optional(), // 水印图片距离绘制 canvas 单元的顶部距离
          /** 水印在canvas 画布上绘制的水平偏移量, 正常情况下，水印绘制在中间位置, 即 offsetTop = gapX / 2 */
          offsetLeft: zod.number().optional(),
          /** 水印绘制时，旋转的角度，单位 ° */
          rotate: zod.number().optional(),
          /** ClassName 前缀 */
          prefixCls: zod.string().optional(),
          /** 高清印图片源, 为了高清屏幕显示，建议使用 2倍或3倍图，优先使用图片渲染水印。 */
          image: zod.string().optional(),
          /** 水印文字内容 */
          content: zod
            .union([zod.string(), zod.array(zod.string())])
            .optional(),
          /** 文字颜色 */
          fontColor: zod.string().optional(),
          /** 文字样式 */
          fontStyle: zod
            .enum(["none", "normal", "italic", "oblique"])
            .optional(),
          /** 文字族 */
          fontFamily: zod.string().optional(),
          /** 文字粗细 */
          fontWeight: zod
            .union([
              zod.literal("normal"),
              zod.literal("light"),
              zod.literal("weight"),
              zod.number(),
            ])
            .optional(),
          /** 文字大小 */
          fontSize: zod.union([zod.number(), zod.string()]).optional(),
        });
        // return zod.record(zod.any()); // object配置
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles, // 发生变化之后重新生成文件
    },
    enableBy: api.EnableBy.config,
  });

  const pkgPath = winPath(join(__dirname, ".."));

  // watermark 组件信息。可以使用不同的包中的组件？
  api.modifyAppData((memo) => {
    const version = require(`${pkgPath}/package.json`).version;
    memo.pluginWatermark = {
      pkgPath,
      version,
    };
    return memo;
  });

  // 生成文件
  api.onGenerateFiles(() => {
    // tmp 生成
    const tmpDir = winPath(join(__dirname, "..", "tmp"));
    const watermarkContentPath = join(tmpDir, "Watermark.tsx");
    const watermarkContent = fs.readFileSync(watermarkContentPath, "utf-8");
    const layoutContentPath = join(tmpDir, "Container.tsx.tpl");
    const layoutContent = fs.readFileSync(layoutContentPath, "utf-8");
    const layoutLessPath = join(tmpDir, "Container.less");
    const layoutLess = fs.readFileSync(layoutLessPath, "utf-8");
    const indexPath = join(tmpDir, "index.tpl");
    const indexContent = fs.readFileSync(indexPath, "utf-8");

    const hasInitialStatePlugin = api.config.initialState;

    // Watermark.tsx
    api.writeTmpFile({
      path: "Watermark.tsx",
      content: watermarkContent,
    });

    // Layout.tsx
    api.writeTmpFile({
      path: "Container.tsx",
      content: Mustache.render(layoutContent, {
        userConfig: JSON.stringify(api.config.watermark, null, 2),
        base: api.config.base || "/",
      }),
    });
    // WatermarkLayout.tsx
    api.writeTmpFile({
      path: "Container.less",
      content: layoutLess,
    });

    api.writeTmpFile({
      path: "index.ts",
      content: indexContent,
    });
    // 写入类型, RunTimeLayoutConfig 是 app.tsx 中 layout 配置的类型
    // 对于动态 layout 配置很有用
    api.writeTmpFile({
      path: "types.d.ts",
      content: `
      ${
        hasInitialStatePlugin
          ? `import type InitialStateType from '@@/plugin-initialState/@@initialState';
type InitDataType = ReturnType<typeof InitialStateType>;
          `
          : "type InitDataType = any;"
      }
export type WatermarkConfig = {
  gapX?: number;
  /** 水印之间的垂直间距 */
  gapY?: number;
  /** 追加的水印元素的z-index */
  zIndex?: number;
  /** 水印的宽度 */
  width?: number;
  /** 水印的高度 */
  height?: number;
  /** 水印在canvas 画布上绘制的垂直偏移量，正常情况下，水印绘制在中间位置, 即 offsetTop = gapY / 2 */
  offsetTop?: number; // 水印图片距离绘制 canvas 单元的顶部距离
  /** 水印在canvas 画布上绘制的水平偏移量, 正常情况下，水印绘制在中间位置, 即 offsetTop = gapX / 2 */
  offsetLeft?: number;
  /** 水印绘制时，旋转的角度，单位 ° */
  rotate?: number;
  /** ClassName 前缀 */
  prefixCls?: string;
  /** 高清印图片源, 为了高清屏幕显示，建议使用 2倍或3倍图，优先使用图片渲染水印。 */
  image?: string;
  /** 水印文字内容 */
  content?: string | string[];
  /** 文字颜色 */
  fontColor?: string;
  /** 文字样式 */
  fontStyle?: "none" | "normal" | "italic" | "oblique";
  /** 文字族 */
  fontFamily?: string;
  /** 文字粗细 */
  fontWeight?: "normal" | "light" | "weight" | number;
  /** 文字大小 */
  fontSize?: number | string;
};
export type RunTimeWatermarkLayoutConfig = (initData: InitDataType) => WatermarkConfig;
    `.trimStart(),
    });
    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
import type { RunTimeWatermarkLayoutConfig } from './types.d';
export interface IRuntimeConfig {
  watermark?: RunTimeWatermarkLayoutConfig
}
      `,
    });

    api.writeTmpFile({
      path: "runtime.tsx",
      content: Mustache.render(
        fs.readFileSync(join(tmpDir, "runtime.tsx.tpl"), "utf-8"),
        {}
      ),
    });
  });

  api.addRuntimePluginKey(() => ["watermark"]);
  // 最初创建，需要在plugin-model dataflowProvider之前
  api.addRuntimePlugin({
    fn: () => withTmpPath({ api, path: "runtime.tsx" }),
    stage: -1 * Number.MAX_SAFE_INTEGER,
  });
};
