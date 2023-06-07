import fs from "fs";
import { join } from "path";
import type { IApi } from "umi";
import { winPath } from "umi/plugin-utils";
import {defaultErrorFilters} from "@middle-cli/plugin-sentry";

export function withTmpPath(opts: { api: IApi; path: string; noPluginDir?: boolean }) {
	return winPath(join(opts.api.paths.absTmpPath, opts.api.plugin.key && !opts.noPluginDir ? `plugin-${opts.api.plugin.key}` : "", opts.path));
}

export default (api: IApi) => {
	// 定义配置属性和值类型
	api.describe({
		key: "sauron",
		config: {
			schema({ zod }) {
				return zod.object({
					// app名称
					appName: zod.string(),
					// 索伦平台的组名
					projectName: zod.string(),
					// 是否开启打印功能
          debug: zod.boolean().optional(),
					// 是否开启性能监控
					useWebPerformance: zod.boolean().optional(),
          useListenException: zod.union([zod.boolean(),zod.object({
            ignore: zod.array(zod.string()).optional().describe("异常忽略，同步sentry的配置")
          })]).optional().describe("是否开启异常上报"),
					webPerformanceRouteList: zod.array(zod.string()).optional(),
					// 是否开启慢请求监控
					useListenAndSendSlowRequest: zod
						.union([
							zod.boolean(),
							zod.object({
								slowRequestTime: zod.number()
								// collect_url_network: zod.function().returns(zod.boolean())
							})
						])
						.optional(),
					// 是否开启PV/UV监控
					useListenPageView: zod.boolean().optional(),
					// 是否开启接口耗时统计
					useListenRequestDuration: zod.boolean().optional(),
					// 是否监听接口异常
					useListenInterfaceException: zod
						.union([
							zod.boolean(),
							zod.object({
								statusCode: zod.object({
									code: zod.array(zod.union([zod.number(), zod.string()])),
									success: zod.array(zod.union([zod.number(), zod.string()]))
								})
							})
						])
						.optional(),
					// 是否自动扫描block埋点
					useAutoListenSendBlock: zod.boolean().optional(),
					// 是否自动扫描click埋点
					useAutoListenAndSendClick: zod.union([zod.boolean(), zod.object({ collect_tags: zod.array(zod.string()), collect_input: zod.boolean() })]).optional()
				});
			},
			onChange: api.ConfigChangeType.regenerateTmpFiles
		},
		enableBy: api.EnableBy.config
	});

	// 生成临时文件并写入配置信息
	const isBoolean = (val: any) => Object.prototype.toString.call(val) === "[object Boolean]";
	const tmpDir = winPath(__dirname);
	api.onGenerateFiles(() => {
		const {
			appName,
			projectName,
      debug = false,
			useWebPerformance = false,
			webPerformanceRouteList = ["/"],
			useListenAndSendSlowRequest = false,
			useListenPageView = false,
			useListenRequestDuration = false,
			useListenInterfaceException = false,
			useAutoListenSendBlock = false,
			useAutoListenAndSendClick = false,
      useListenException
		} = api.config.sauron;


    // 同步sentry配置
    const ignore = typeof useListenException ==='object'? (useListenException.ignore||api.config.sentry?.ignore || defaultErrorFilters): undefined;

		api.writeTmpFile({
			path: "runtime.tsx",
			tplPath: join(tmpDir, "runtime.tsx.tpl"),
			context: {
				appName,
				projectName,
        debug,
				useWebPerformance,
        useListenException: useListenException? JSON.stringify({
          ignore: ignore
        },null,2): false,
				webPerformanceRouteList: JSON.stringify(webPerformanceRouteList),
        useListenAndSendSlowRequest: isBoolean(useListenAndSendSlowRequest) ? useListenAndSendSlowRequest : JSON.stringify(useListenAndSendSlowRequest,null,2),
				useListenPageView,
				useListenRequestDuration,
				useListenInterfaceException: isBoolean(useListenInterfaceException) ? useListenInterfaceException : JSON.stringify(useListenInterfaceException,null,2),
				useAutoListenSendBlock,
				useAutoListenAndSendClick: isBoolean(useAutoListenAndSendClick) ? useAutoListenAndSendClick : JSON.stringify(useAutoListenAndSendClick,null,2)
			}
		});
	});

	// 运行时配置
	api.addRuntimePluginKey(() => ["sauron"]);
	api.addRuntimePlugin({
		fn: () => withTmpPath({ api, path: "runtime.tsx" }),
		stage: -1 * Number.MAX_SAFE_INTEGER
	});

	function cleanSourceMapAfterUpload(dir: string) {
		fs.readdirSync(dir).forEach(file => {
			const filePath = join(dir, file);
			if (fs.statSync(filePath).isDirectory()) {
				return cleanSourceMapAfterUpload(filePath);
			}
			if (/\.map$/.test(filePath)) {
				fs.rmSync(filePath);
			}
			if (/\.css$/.test(filePath) || /\.js$/.test(filePath)) {
				fs.writeFileSync(
					filePath,
					fs
						.readFileSync(filePath, "utf8")
						.replace(/\/\*\# sourceMappingURL=.*/g, "")
						.replace(/\/\/\# sourceMappingURL=.*/g, "")
				);
			}
		});
	}
	// 打包完成，清理sourceMap
	api.onBuildComplete(({ isFirstCompile }) => {
		const outputPath = api.config.outputPath || "dist";
		cleanSourceMapAfterUpload(outputPath);
	});
};
