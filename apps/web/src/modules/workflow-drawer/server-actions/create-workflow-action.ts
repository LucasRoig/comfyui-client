"use server"; // don't forget to add this!

import { createWorkflow } from "@repo/data-access";
import { actionClient } from "../../../@lib/safe-action";

export const createWorkflowAction = actionClient.action(async (_input) => {
  try {
    const workflow = await createWorkflow();
    return workflow;
  } catch (error) {
    console.error(error);
    throw error;
  }
});
