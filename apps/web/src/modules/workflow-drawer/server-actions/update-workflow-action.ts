"use server"; // don't forget to add this!

import { jsonWorkflowShema, updateWorkflow } from "@repo/data-access";
import z from "zod/v4";
import { actionClient } from "../../../@lib/safe-action";

export const updateWorkflowAction = actionClient
  .inputSchema(
    z.object({
      id: z.string(),
      json: z.unknown(),
    }),
  )
  .action(async ({ clientInput }) => {
    try {
      const validJson = jsonWorkflowShema.parse(clientInput.json);
      await updateWorkflow(clientInput.id, validJson);
    } catch (error) {
      console.error(JSON.stringify(error));
      throw error;
    }
  });
