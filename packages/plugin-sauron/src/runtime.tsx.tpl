import { init } from "@yh/yh-sauron";

init({
	app_name: "{{{appName}}}",
	project_name: "{{{projectName}}}",
	env: "{{{env}}}",
	useLog: {{{useLog}}},
	useWebPerformance: {{{useWebPerformance}}},
	platform_name: "{{{platformName}}}",
	webPerformanceRouteList: {{{webPerformanceRouteList}}},
	useListenAndSendSlowRquest: {{{useListenAndSendSlowRquest}}},
	useListenPageView: {{{useListenPageView}}},
	useListenRequestDuration: {{{useListenRequestDuration}}},
	useListenInterfaceException: {{{useListenInterfaceException}}},
	useAutoListenSendBlock: {{{useAutoListenSendBlock}}},
	useAutoListenAndSendClick: {{{useAutoListenAndSendClick}}}
});