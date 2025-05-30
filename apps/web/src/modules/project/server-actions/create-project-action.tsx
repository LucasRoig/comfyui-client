"use server";

import { drizzleSchema } from "@repo/database";
import { v4 as uuidv4 } from "uuid";
import z from "zod/v4";
import { database } from "../../../@lib/database";
import { actionClient } from "../../../@lib/safe-action";

export const createProjectAction = actionClient
  .inputSchema(
    z.object({
      name: z.string().min(5),
    }),
  )
  .action(async ({ parsedInput }) => {
    const insertResult = await database
      .insert(drizzleSchema.project)
      .values({
        name: parsedInput.name,
        id: uuidv4(),
      })
      .returning();
    const project = insertResult[0];
    if (!project) {
      throw new Error("Failed to create project");
    }
    return project;
  });
