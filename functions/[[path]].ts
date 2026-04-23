import * as build from "../build/server/index.js";

export const onRequest = async (context: any) => {
  const handler = (build as any).entry?.module?.default;
  
  if (!handler || typeof handler !== 'function') {
    console.error('Handler not found', { 
      handlerType: typeof handler,
      hasEntry: !!(build as any).entry,
      hasModule: !!(build as any).entry?.module
    });
    return new Response('Handler not found', { status: 500 });
  }
  
  try {
    return await handler(
      context.request,
      200,
      new Headers(),
      {
        getLoadContext: () => ({
          cloudflare: context,
        }),
      }
    );
  } catch (error) {
    console.error("Handler error:", error);
    return new Response(String(error), { status: 500 });
  }
};
