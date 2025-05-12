"use server"; // don't forget to add this!

import { createClient } from "@repo/comfy-ui-api-client";
import { actionClient } from "../../../@lib/safe-action";

export const getNodesAction = actionClient.action(async (_input) => {
  const comfyClient = createClient(process.env.COMFY_HTTP_URL!);
  const response = await comfyClient.getNodes();
  return response;
});
