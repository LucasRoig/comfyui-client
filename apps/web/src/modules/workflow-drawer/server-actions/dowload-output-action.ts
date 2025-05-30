"use server"; // don't forget to add this!

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@repo/comfy-ui-api-client";
import { addOutputImage } from "@repo/data-access";
import { v4 as uuidv4 } from "uuid";
import z from "zod/v4";
import { actionClient } from "../../../@lib/safe-action";
import { getServerSideEnv } from "../../../@lib/server-side-env";
export const downloadOutputAction = actionClient
  .inputSchema(
    z.object({
      comfy: z.object({
        filename: z.string(),
        subfolder: z.string(),
        type: z.string(),
      }),
      nodeId: z.string(),
      promptId: z.string(),
    }),
  )
  .action(async (input) => {
    try {
      const client = createClient(getServerSideEnv().COMFY_HTTP_URL);
      const file = await client.getImage(input.parsedInput.comfy.filename);
      if (file.isOk()) {
        const uuid = uuidv4();
        const ouputDir = path.join(getServerSideEnv().WORKSPACE, "ouputs");
        if (!fs.existsSync(ouputDir)) {
          fs.mkdirSync(ouputDir);
        }
        const fileName = `${uuid}.png`;
        const fullPath = path.join(ouputDir, fileName);
        const relativePath = fullPath.replace(getServerSideEnv().WORKSPACE, "");
        fs.writeFileSync(fullPath, Buffer.from(file.value));
        await addOutputImage({
          comfy: {
            filename: input.parsedInput.comfy.filename,
            subfolder: input.parsedInput.comfy.subfolder,
            type: input.parsedInput.comfy.type,
          },
          image: {
            filename: fileName,
            relativePath,
            uuid,
          },
          nodeId: input.parsedInput.nodeId,
          promptId: input.parsedInput.promptId,
        });
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
