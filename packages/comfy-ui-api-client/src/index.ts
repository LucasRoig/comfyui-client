import ky from "ky";
import { err, ok } from "neverthrow";
import { simpleWorkflow } from "./simple-workflow";

export function createClient(url: string) {
  const api = ky.create({
    prefixUrl: url,
    // throwHttpErrors: false
  });
  return {
    queueWorkflow: async () => {
      try {
        const response = await api.post("prompt", {
          json: simpleWorkflow,
        });
        console.log(response.status);
        const jsonResponse = await response.json();
        return ok(jsonResponse);
      } catch (error) {
        return err(error);
      }
    },
  };
}
