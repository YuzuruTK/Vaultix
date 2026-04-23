export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  
  // Let static assets through
  if (url.pathname.startsWith('/assets/') || url.pathname === '/favicon.ico') {
    return context.next();
  }
  
  // For all other routes, serve index.html for SPA routing
  try {
    const response = await context.env.ASSETS.fetch(
      new Request(new URL('/index.html', url.origin), context.request)
    );
    return new Response(response.body, response);
  } catch (error) {
    return new Response('Not found', { status: 404 });
  }
};
