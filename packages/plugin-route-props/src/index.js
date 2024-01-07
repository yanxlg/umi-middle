"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@middle-cli/utils");
exports.default = (api) => {
    api.describe({
        key: "extendRouteProps",
        config: {
            schema({ zod }) {
                return zod.array(zod.string()).optional();
            },
        },
        enableBy: api.EnableBy.register,
    });
    api.modifyRoutes((memo) => {
        const fields = api.config.extendRouteProps || ['layout', 'login'];
        Object.keys(memo).forEach((id) => {
            const route = memo[id];
            const content = route.__content; // 内容
            if (content) { // 解析内容
                const properties = (0, utils_1.getConfigPropertiesFromSource)(content, route.file, fields);
                Object.assign(route, properties);
            }
        });
        return memo;
    });
};
