"use server"; // don't forget to add this!

import { createClient, postPromptRequestSchema } from "@repo/comfy-ui-api-client";
import { actionClient } from "../../../@lib/safe-action";
import { getServerSideEnv } from "../../../@lib/server-side-env";

export const queueWorkflowAction = actionClient.schema(postPromptRequestSchema).action(async ({ parsedInput }) => {
  const comfyClient = createClient(getServerSideEnv().COMFY_HTTP_URL);
  const response = await comfyClient.queueWorkflow(parsedInput);
  if (response.isErr()) {
    console.error(response.error);
    throw response.error;
  }
  return response._unsafeUnwrap();
});
