import { os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { asc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { z } from "zod/v4";
import { database } from "../../../@lib/database";

const findAllProject = os
  .handler(async () => {
    const projects = await database.query.projects.findMany();
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
      .insert(drizzleSchema.projects)
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

const getFilesInProject = os
  .input(
    z.object({
      projectId: z.string(),
    }),
  )
  .handler(({ input }) => {
    return database.query.inputImages.findMany({
      where: eq(drizzleSchema.inputImages.projectId, input.projectId),
      orderBy: [asc(drizzleSchema.inputImages.originalPath)],
    });
  })
  .callable();

export const projectRouter = {
  findAllProject,
  createProject,
  getFilesInProject,
};
