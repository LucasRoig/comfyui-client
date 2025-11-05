import { os, type InferRouterInputs, type InferRouterOutputs } from "@orpc/server";
import { listProjectProcedure } from "./use-case/project/list-projects";

export const appRouter = os.router({
  ping: os.handler(() => "pong"),
  projects: {
    list: listProjectProcedure,
  },
});

export type RouterOutputs = InferRouterOutputs<typeof appRouter>;
export type RouterInputs = InferRouterInputs<typeof appRouter>;
