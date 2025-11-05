import { os, type InferRouterInputs, type InferRouterOutputs } from "@orpc/server";

export const appRouter = os.router({
  ping: os.handler(() => "pong"),
});

export type RouterOutputs = InferRouterOutputs<typeof appRouter>;
export type RouterInputs = InferRouterInputs<typeof appRouter>;
