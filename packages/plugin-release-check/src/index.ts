/*
 * @Author: yanxlg
 * @Date: 2023-05-01 21:15:00
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-27 12:10:15
 * @Description:
 * release check
 *
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */

import { run } from "release-check";
import { IApi } from "umi";

const isProduction = process.env.NODE_ENV === "production";

export default async (api: IApi) => {
  api.describe({
    key: "releaseCheck",
    config: {
      schema({ zod }) {
        return zod.boolean();
      },
    },
    enableBy: api.EnableBy.register,
  });

  if (isProduction) {
    api.onStart(async () => {
      if (api.name === "build" && api.config.releaseCheck !== false) {
        // 执行检测
        await run();
      }
    });
  }
};
