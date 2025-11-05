import { type InferRouterInputs, type InferRouterOutputs, os } from "@orpc/server";
import { projectRouter } from "../modules/project/procedures/project-procedures";

export const orpcRouter = {
  project: projectRouter,
  ping: os.handler(() => "pong").callable(),
};

export type RouterOutputs = InferRouterOutputs<typeof orpcRouter>;
export type RouterInputs = InferRouterInputs<typeof orpcRouter>;
