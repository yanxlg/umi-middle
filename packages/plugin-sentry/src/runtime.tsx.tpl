import * as Sentry from "@sentry/react";

// release 会被sentry-plugin 自动inject
Sentry.init({
  dsn: "{{{dsn}}}",
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});