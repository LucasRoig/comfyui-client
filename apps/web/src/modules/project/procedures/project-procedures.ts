import { os } from "@orpc/server";
import { database } from "../../../@lib/database";

const findAllProject = os
  .handler(async () => {
    const projects = await database.query.project.findMany();
    return projects;
  })
  .callable();

export const projectRouter = {
  findAllProject,
};
