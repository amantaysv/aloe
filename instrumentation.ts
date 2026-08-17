import type { Instrumentation } from "next";

/**
 * Central sink for server-side errors. Until now the entire observability story was ~30
 * `console.error` calls that nobody reads — while `app/global-error.tsx` told visitors "мы уже
 * знаем о проблеме", which was simply untrue.
 *
 * This hook receives every uncaught error from Server Components, route handlers, server actions
 * and middleware. It currently formats them for the platform log, which at least makes them
 * greppable and gives one place to wire Sentry (or any sink) into later:
 *
 *   Sentry.captureException(err, { extra: { path: request.path, ...context } })
 */
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const error = err as { message?: string; digest?: string; stack?: string };

  console.error(
    JSON.stringify({
      level: "error",
      at: "onRequestError",
      // `digest` is what app/error.tsx shows the user, so it ties a report to a log line.
      digest: error.digest,
      message: error.message ?? String(err),
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
      revalidateReason: context.revalidateReason,
    }),
  );

  if (error.stack) console.error(error.stack);
};
