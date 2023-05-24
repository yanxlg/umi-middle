/*
 * @Author: yanxlg
 * @Date: 2023-05-24 15:24:35
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-24 15:38:45
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import { getAllModels } from "@umijs/plugins/dist/dva";
import { Model } from "@umijs/plugins/dist/utils/modelUtils";
import * as path from "path";
import { IApi } from "umi";
import { winPath } from "umi/plugin-utils";
export function withTmpPath(opts: {
  api: IApi;
  path: string;
  noPluginDir?: boolean;
}) {
  return winPath(
    path.join(
      opts.api.paths.absTmpPath,
      opts.api.plugin.key && !opts.noPluginDir
        ? `plugin-${opts.api.plugin.key}`
        : "",
      opts.path
    )
  );
}

function getModelsContent(models: Model[]) {
  const imports: string[] = [];
  const modelProps: string[] = [];
  models.forEach((model) => {
    const fileWithoutExt = winPath(
      path.format({
        dir: path.dirname(model.file),
        base: path.basename(model.file, path.extname(model.file)),
      })
    );
    if (model.exportName !== "default") {
      imports.push(
        `import { ${model.exportName} as ${model.id} } from '${fileWithoutExt}';`
      );
    } else {
      imports.push(`import ${model.id} from '${fileWithoutExt}';`);
    }
    modelProps.push(`  '${model.namespace}': ${model.id},`);
  });
  return `
${imports.join("\n")}

export const models = {
${modelProps.join("\n")}
} as const`;
}

export default (api: IApi) => {
  api.describe({
    key: "dva-ts",
    config: {
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.register,
  });

  api.onGenerateFiles((args) => {
    const dvaIsEnable = api.isPluginEnable("dva");
    if (dvaIsEnable) {
      const models = args.isFirstTime
        ? api.appData.pluginDva.models
        : getAllModels(api);

      api.writeTmpFile({
        path: "models.ts",
        content: getModelsContent(models),
      });
    }
  });
};
