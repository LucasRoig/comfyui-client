"use server"; // don't forget to add this!

import { createClient } from "@repo/comfy-ui-api-client";
import { actionClient } from "../../../@lib/safe-action";
import { getServerSideEnv } from "../../../@lib/server-side-env";

export const getNodesAction = actionClient.action(async (_input) => {
  try {
    const comfyClient = createClient(getServerSideEnv().COMFY_HTTP_URL);
    const response = await comfyClient.getNodes();
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
});
