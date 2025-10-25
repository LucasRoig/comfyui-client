import { RPCHandler } from "@orpc/server/fetch"
import type { Route } from "./+types/orpc"
import { appRouter } from "~/.server";

const handler = new RPCHandler(appRouter);

export const loader = (args: Route.LoaderArgs) => {
  return handleRequest(args)
}

export const action = (args: Route.ActionArgs) => {
  return handleRequest(args)
}

const handleRequest = async ({ request }: Route.LoaderArgs | Route.ActionArgs) => {
  const { response } = await handler.handle(request, {
    prefix: '/api/orpc',
    context: {} // Provide initial context if needed
  });

  return response ?? new Response('Not Found', { status: 404 })
}