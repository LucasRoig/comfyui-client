import { err, ok } from "neverthrow";
import { simpleWorkflow } from "../simple-workflow";
import type { KyInstance } from "ky";

export const postPrompt = (api: KyInstance) => async () => {
  try {
    const response = await api.post("prompt", {
      json: simpleWorkflow,
    });
    console.debug(response.status);
    const jsonResponse = await response.json();
    return ok(jsonResponse);
  } catch (error) {
    return err(error);
  }
}
