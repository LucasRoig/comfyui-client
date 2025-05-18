"use server"; // don't forget to add this!

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@repo/comfy-ui-api-client";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { actionClient } from "../../../@lib/safe-action";
import { getServerSideEnv } from "../../../@lib/server-side-env";
export const downloadOutputAction = actionClient
  .schema(
    z.object({
      filename: z.string(),
    }),
  )
  .action(async (input) => {
    try {
      const client = createClient(getServerSideEnv().COMFY_HTTP_URL);
      const file = await client.getImage(input.parsedInput.filename);
      if (file.isOk()) {
        const uuid = uuidv4();
        const ouputDir = path.join(getServerSideEnv().WORKSPACE, "ouputs");
        if (!fs.existsSync(ouputDir)) {
          fs.mkdirSync(ouputDir);
        }
        const filePath = path.join(ouputDir, `${uuid}.png`);
        fs.writeFileSync(filePath, Buffer.from(file.value));
        return {
          uuid,
        };
      }
      throw file.error;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
