import { init } from "@yh/yh-sauron";

init({
	app_name: "{{{appName}}}",
	project_name: "{{{projectName}}}",
	env: "{{{env}}}",
	debug: {{{debug}}},
	useWebPerformance: {{{useWebPerformance}}},
	webPerformanceRouteList: {{{webPerformanceRouteList}}},
	useListenAndSendSlowRequest: {{{useListenAndSendSlowRquest}}},
	useListenPageView: {{{useListenPageView}}},
	useListenRequestDuration: {{{useListenRequestDuration}}},
	useListenInterfaceException: {{{useListenInterfaceException}}},
	useAutoListenSendBlock: {{{useAutoListenSendBlock}}},
	useAutoListenAndSendClick: {{{useAutoListenAndSendClick}}}
});
