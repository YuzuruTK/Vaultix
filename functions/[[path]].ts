import * as build from "../build/server/index.js";

export const onRequest = async (context: any) => {
  const handler = (build as any).entry?.module?.default;
  
  if (!handler || typeof handler !== 'function') {
    console.error('Handler not found', { handler: typeof handler });
    return new Response('Handler not found', { status: 500 });
  }
  
  try {
    // Build the remixContext with all required Remix internals
    const remixContext = {
      manifest: {
        version: (build as any).version,
        entry: (build as any).entry,
        routes: (build as any).routes,
        url: (build as any).publicPath,
        future: (build as any).future,
        isSpaMode: (build as any).isSpaMode,
      },
      getLoadContext: () => ({
        cloudflare: context,
      }),
    };
    
    return await handler(
      context.request,
      200,
      new Headers(),
      remixContext
    );
  } catch (error) {
    console.error("Handler error:", error);
    return new Response(`${error}`, { status: 500 });
  }
};
