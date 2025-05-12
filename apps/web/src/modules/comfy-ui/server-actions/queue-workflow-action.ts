"use server"; // don't forget to add this!

import { createClient } from "@repo/comfy-ui-api-client";
import z from "zod";
import { actionClient } from "../../../@lib/safe-action";

export const queueWorkflowAction = actionClient
  .schema(
    z.object({
      sessionId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const comfyClient = createClient(process.env.COMFY_HTTP_URL!);
    const response = await comfyClient.queueWorkflow({
      client_id: parsedInput.sessionId,
    });
    if (response.isErr()) {
      console.error(response.error);
      throw response.error;
    }
    return response._unsafeUnwrap();
  });
