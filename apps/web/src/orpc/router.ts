import { os } from "@orpc/server";
import { projectRouter } from "../modules/project/procedures/project-procedures";

export const orpcRouter = {
  project: projectRouter,
  ping: os.handler(() => "pong").callable(),
};
