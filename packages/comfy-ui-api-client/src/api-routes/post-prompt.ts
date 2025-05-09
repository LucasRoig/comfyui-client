import type { KyInstance } from "ky";
import { err, ok } from "neverthrow";
import z from "zod";
import { simpleWorkflow } from "../simple-workflow";

const postPromptResponseSchema = z.object({
  prompt_id: z.string(),
  number: z.number(),
  node_errors: z.object(),
});

const postPromptRequestSchema = z.object({
  client_id: z.string(),
});

type PostPromptRequest = z.infer<typeof postPromptRequestSchema>;

export const postPrompt = (api: KyInstance) => async (request: PostPromptRequest) => {
  try {
    const response = await api.post("prompt", {
      json: {
        ...simpleWorkflow,
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
