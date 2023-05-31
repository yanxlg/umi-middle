/*
 * @Author: yanxlg
 * @Date: 2022-07-25 09:50:22
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-03-20 13:02:45
 * @Description:
 *
 * Copyright (c) 2022 by yanxlg, All Rights Reserved.
 */

const nextVersion = "0.0.1-alpha.2";

const fs = require("fs-extra");
const _path = require("path");

const dir = "./packages";

fs.readdir(dir, function (err, paths) {
  if (err) {
    throw err;
  }
  paths.forEach(function (path) {
    const _dirPath = _path.join(dir, path);
    fs.stat(_dirPath, function (err, st) {
      if (err) {
        throw err;
      }
      // 判断是否为文件
      if (st.isDirectory()) {
        const packageFile = _path.join(_dirPath, "package.json");
        let packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
        // 所有的相关版本全部更新
        if(!/^\release-check/.test(path)){
          packageJson.version = nextVersion;
        }
        if (packageJson.devDependencies) {
          Object.keys(packageJson.devDependencies).forEach(function (key) {
            if (/^\@middle-cli/.test(key)) {
              packageJson.devDependencies[key] = nextVersion;
            }
          });
        }
        if (packageJson.dependencies) {
          Object.keys(packageJson.dependencies).forEach(function (key) {
            if (/^\@middle-cli/.test(key)) {
              packageJson.dependencies[key] = nextVersion;
            }
          });
        }
        fs.writeFileSync(
          packageFile,
          JSON.stringify(packageJson, null, 2),
          "utf8"
        );
      }
    });
  });
});
