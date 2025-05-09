"use server"; // don't forget to add this!

import { createClient } from "@repo/comfy-ui-api-client";
import { actionClient } from "../../../@lib/safe-action";

export const getNodesAction = actionClient.action(async (_input) => {
  const comfyClient = createClient("http://172.22.80.1:8000");
  const response = await comfyClient.getNodes();
  return response;
});
