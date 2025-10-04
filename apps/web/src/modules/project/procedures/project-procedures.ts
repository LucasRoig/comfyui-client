import { os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { v4 as uuid } from "uuid";
import { z } from "zod/v4";
import { database } from "../../../@lib/database";

const findAllProject = os
  .handler(async () => {
    const projects = await database.query.project.findMany();
    return projects;
  })
  .callable();

const createProject = os
  .input(
    z.object({
      name: z.string().min(3),
    }),
  )
  .handler(async ({ input }) => {
    const insertResult = await database
      .insert(drizzleSchema.project)
      .values({
        name: input.name,
        id: uuid(),
      })
      .returning();
    const project = insertResult[0];
    if (!project) {
      throw new Error("Failed to create project");
    }
    return project;
  })
  .callable();

export const projectRouter = {
  findAllProject,
  createProject,
};
