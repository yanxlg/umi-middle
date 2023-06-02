import fs from "fs";
import { join } from "path";
import type { IApi } from "umi";
import { winPath } from "umi/plugin-utils";

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
					// 以下是可选参数
					// 环境：dev、online、online-inside
					env: zod.string().optional(),
					// 是否开启打印功能
					useLog: zod.boolean().optional(),
					// 是否开启性能监控
					useWebPerformance: zod.boolean().optional(),
					platformName: zod.string().optional(),
					webPerformanceRouteList: zod.array(zod.string()).optional(),
					// 是否开启慢请求监控
					useListenAndSendSlowRquest: zod
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

	// 通过链式编程，修改webpack默认配置
	api.chainWebpack((memo, { webpack, env }) => {});

	// 生成临时文件并写入配置信息
	const isBoolean = (val: any) => Object.prototype.toString.call(val) === "[object Boolean]";
	const tmpDir = winPath(__dirname);
	api.onGenerateFiles(() => {
		const {
			env = "dev",
			appName = "永辉超市",
			projectName = "yh_life",
			useLog = false,
			useWebPerformance = false,
			platformName = "web-performance",
			webPerformanceRouteList = ["/"],
			useListenAndSendSlowRquest = false,
			useListenPageView = false,
			useListenRequestDuration = false,
			useListenInterfaceException = false,
			useAutoListenSendBlock = false,
			useAutoListenAndSendClick = false
		} = api.config.sauron;

		api.writeTmpFile({
			path: "runtime.tsx",
			tplPath: join(tmpDir, "runtime.tsx.tpl"),
			context: {
				env,
				appName,
				projectName,
				useLog,
				useWebPerformance,
				platformName,
				webPerformanceRouteList: JSON.stringify(webPerformanceRouteList),
				useListenAndSendSlowRquest: isBoolean(useListenAndSendSlowRquest) ? useListenAndSendSlowRquest : JSON.stringify(useListenAndSendSlowRquest),
				useListenPageView,
				useListenRequestDuration,
				useListenInterfaceException: isBoolean(useListenInterfaceException) ? useListenInterfaceException : JSON.stringify(useListenInterfaceException),
				useAutoListenSendBlock,
				useAutoListenAndSendClick: isBoolean(useAutoListenAndSendClick) ? useAutoListenAndSendClick : JSON.stringify(useAutoListenAndSendClick)
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
