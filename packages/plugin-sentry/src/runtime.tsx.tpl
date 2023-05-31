import * as Sentry from "@sentry/react";
import { InjectEnvs } from 'umi';

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
  environment: InjectEnvs?.sentry_environment??"local",
  debug: {{{debug}}},
  disabled: {{{disabled}}},
  ignoreErrors: {{{ignore}}},
});
