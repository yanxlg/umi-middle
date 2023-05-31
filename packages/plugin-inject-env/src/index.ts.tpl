/*
 * @Author: yanxlg
 * @Date: 2023-04-26 13:58:45
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-04-28 00:08:22
 * @Description: 环境变量注入
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */

{{#vars}}
const {{{key}}} = "{{{value}}}";
{{/vars}}

const InjectEnvs = { {{{varKeys}}} };

export { InjectEnvs };
