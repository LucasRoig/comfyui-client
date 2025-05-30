"use server";

import z from "zod";
import { actionClient } from "../../../@lib/safe-action";

export const createProjectAction = actionClient
  .schema(
    z.object({
      name: z.string().min(5),
    }),
  )
  .action(async (input) => {
    const project = input.parsedInput;
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return project;
  });
