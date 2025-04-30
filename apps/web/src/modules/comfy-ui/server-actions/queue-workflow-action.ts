"use server"; // don't forget to add this!

import { createClient } from "@repo/comfy-ui-api-client";
import { actionClient } from "../../../@lib/safe-action";

export const queueWorkflowAction = actionClient.action(async (_input) => {
  const comfyClient = createClient("http://172.22.80.1:8000");
  const response = await comfyClient.queueWorkflow();
  if (response.isErr()) {
    console.error(response.error);
    throw response.error;
  }
  return response._unsafeUnwrap();
});
