"use server"; // don't forget to add this!

import { createClient } from "@repo/comfy-ui-api-client";
import { actionClient } from "../../../@lib/safe-action";
import { getServerSideEnv } from "../../../@lib/server-side-env";

export const getQueueStateAction = actionClient.action(async (_input) => {
  const comfyClient = createClient(getServerSideEnv().COMFY_HTTP_URL);
  const response = await comfyClient.getQueue();
  if (response.isErr()) {
    console.error(response.error);
    throw response.error;
  }
  return response._unsafeUnwrap();
});
