import { init } from "@yh/yh-sauron";
import { InjectEnvs } from 'umi';

init({
	app_name: "{{{appName}}}",
	project_name: "{{{projectName}}}",
	env: InjectEnvs?.sauron_environment || 'dev',
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
