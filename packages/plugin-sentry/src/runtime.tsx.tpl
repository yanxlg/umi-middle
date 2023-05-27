import * as Sentry from "@sentry/react";

// release 会被sentry-plugin 自动inject
Sentry.init({
  dsn: "{{{dsn}}}",
  integrations: [
    new Sentry.BrowserTracing(),
    // new Sentry.Replay() // 行为轨迹回放。
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: ""// 环境变量，不同的环境值，需要在部署工作台inject进来。 docker 和ng方案，怎么自动化？？？
});