import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext
) {
  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");
  const readyOption = isbot(userAgent ?? "") || remixContext.isSpaMode
    ? "onAllReady"
    : "onShellReady";

  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />,
    {
      [readyOption]() {
        shellRendered = true;
      },
      onError(error: unknown) {
        responseStatusCode = 500;
        if (shellRendered) {
          console.error(error);
        }
      },
    }
  );

  if (isbot(userAgent ?? "")) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
