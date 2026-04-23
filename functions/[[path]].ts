import * as build from "../build/server/index.js";

export const onRequest = async (context: any) => {
  const handler = (build as any).default;
  
  return handler(
    context.request,
    context.env,
    context
  );
};
