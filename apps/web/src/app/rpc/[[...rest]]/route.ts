import { RPCHandler } from "@orpc/server/fetch";
import { orpcRouter } from "../../../orpc/router";

const handler = new RPCHandler(orpcRouter);

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/rpc",
    context: {}, // Provide initial context if needed
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
