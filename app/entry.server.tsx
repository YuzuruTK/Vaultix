import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: any
) {
  const userAgent = request.headers.get("user-agent");
  const isBotRequest = isbot(userAgent);

  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: AbortSignal.timeout(ABORT_DELAY),
      onError(error: unknown) {
        console.error(error);
        responseStatusCode = 500;
      },
    }
  );

  if (isBotRequest) {
    await body.allReady;
  }

  return new Response(body, {
    headers: {
      ...Object.fromEntries(responseHeaders),
      "Content-Type": "text/html",
    },
    status: responseStatusCode,
  });
}

export const onRequest = handleRequest;
