"use server"; // don't forget to add this!

import { updateWorkflow, jsonWorkflowShema } from "@repo/data-access" 
import { actionClient } from "../../../@lib/safe-action";
import z from "zod";

export const updateWorkflowAction = actionClient.schema(z.object({
  id: z.string(),
  json: z.unknown(),
})).action(async ({clientInput}) => {
  try {
    const validJson = jsonWorkflowShema.parse(clientInput.json);
    await updateWorkflow(clientInput.id, validJson);
  } catch (error) {
    console.error(JSON.stringify(error));
    throw error;
  }
});
