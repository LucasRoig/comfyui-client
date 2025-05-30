import type { KyInstance } from "ky";
import { err, ok } from "neverthrow";
import z from "zod/v4";

const queueItemSchema = z.tuple([z.number(), z.string(), z.unknown(), z.unknown(), z.unknown()]).transform((x) => ({
  promptId: x[1],
  workflow: x[2],
  index: x[0],
}));

const responseSchema = z.object({
  queue_running: z.array(queueItemSchema),
  queue_pending: z.array(queueItemSchema),
});

export const getQueue = (api: KyInstance) => async () => {
  try {
    const response = await api.get("queue").json();
    const validResponse = responseSchema.safeParse(response);
    if (validResponse.success) {
      return ok(validResponse.data);
    } else {
      console.error(response);
      return err(validResponse.error);
    }
  } catch (error) {
    return err(error);
  }
};
