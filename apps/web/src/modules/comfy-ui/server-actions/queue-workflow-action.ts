"use server"; // don't forget to add this!

import { createClient } from "@repo/comfy-ui-api-client";
import { postPromptRequestSchema } from "@repo/comfy-ui-api-client";
import { actionClient } from "../../../@lib/safe-action";

export const queueWorkflowAction = actionClient.schema(postPromptRequestSchema).action(async ({ parsedInput }) => {
  const comfyClient = createClient(process.env.COMFY_HTTP_URL!);
  const response = await comfyClient.queueWorkflow(parsedInput);
  if (response.isErr()) {
    console.error(response.error);
    throw response.error;
  }
  return response._unsafeUnwrap();
});
