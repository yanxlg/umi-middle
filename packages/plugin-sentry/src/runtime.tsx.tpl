import * as Sentry from "@sentry/react";
import { InjectEnvs } from 'umi';

// 微前端 需要区分应用。 sourcemap 怎么处理？？？  异常怎么区分。
Sentry.init({
  dsn: "{{{dsn}}}",
  integrations: [
    new Sentry.BrowserTracing(),
    // new Sentry.Replay() // 行为轨迹回放。
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: InjectEnvs?.sentry_environment??"local", // inject from environment
  debug: {{{debug}}},
  disabled: {{{disabled}}},
  ignoreErrors: {{{ignore}}},
  {{#release}}
  release: "{{{release}}}",
  {{/release}}
});
