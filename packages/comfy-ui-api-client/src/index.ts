import ky from "ky";
import { err, ok } from "neverthrow";
import z from "zod";
import { simpleWorkflow } from "./simple-workflow";

const statusMessageSchema = z.object({
  type: z.literal("status"),
  data: z.object({
    sid: z.string(),
    status: z.object({
      exec_info: z.object({
        queue_remaining: z.number(),
      }),
    }),
  }),
});

export type WebSocketStatusMessage = z.infer<typeof statusMessageSchema>;

export function createWebsocket(
  url: string,
  eventHandlers: {
    onStatusMessage?: (statusMessage: WebSocketStatusMessage) => void;
  } = {},
) {
  const socket = new WebSocket(`${url}/ws`);
  socket.binaryType = "arraybuffer";

  socket.addEventListener("open", () => {
    console.log("WebSocket is open");
  });

  socket.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      console.log("WS: Array Buffer received from server ", event.data);
    } else {
      const asJson = JSON.parse(event.data);
      const statusMessage = statusMessageSchema.safeParse(asJson);
      if (statusMessage.success) {
        console.log("WS: Reveived status message", statusMessage.data);
        if (eventHandlers.onStatusMessage) {
          eventHandlers.onStatusMessage(statusMessage.data);
        }
      } else {
        console.log("WS: Failed to parse message", asJson);
      }
    }
  });

  return socket;
}

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
