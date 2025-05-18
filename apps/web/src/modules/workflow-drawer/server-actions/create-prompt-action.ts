"use server"; // don't forget to add this!

import { createPrompt, jsonWorkflowShema } from "@repo/data-access";
import z from "zod";
import { actionClient } from "../../../@lib/safe-action";

export const createPromptAction = actionClient
  .schema(
    z.object({
      promptId: z.string(),
      workflowId: z.string(),
      json: z.unknown(),
    }),
  )
  .action(async (input) => {
    try {
      const validJson = jsonWorkflowShema.parse(input.parsedInput.json);
      const workflow = await createPrompt({
        promptId: input.parsedInput.promptId,
        workflowId: input.parsedInput.workflowId,
        json: validJson,
      });
      return workflow;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
