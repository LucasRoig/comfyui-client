import type { KyInstance } from "ky";
import { err, ok } from "neverthrow";
import z from "zod";

const postPromptResponseSchema = z.object({
  prompt_id: z.string(),
  number: z.number(),
  node_errors: z.object(),
});

export const postPromptRequestSchema = z.object({
  client_id: z.string(),
  prompt: z.record(
    z.string(),
    z.object({
      //Record<nodeId, node>
      inputs: z.record(
        z.string(),
        z.union([
          z.string(),
          z.number(),
          z.boolean(),
          z.tuple([z.string(), z.number()]), //For edge [nodeId, outputIndex]
        ]),
      ),
      class_type: z.string(), //node type
    }),
  ),
});

export type PostPromptRequest = z.infer<typeof postPromptRequestSchema>;

export const postPrompt = (api: KyInstance) => async (request: PostPromptRequest) => {
  try {
    console.log(JSON.stringify(request));
    const response = await api.post("prompt", {
      json: {
        ...request,
      },
    });
    console.debug(response.status);
    const jsonResponse = await response.json();
    console.debug(jsonResponse);
    const parsed = postPromptResponseSchema.parse(jsonResponse);
    return ok(parsed);
  } catch (error) {
    return err(error);
  }
};
