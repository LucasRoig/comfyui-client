import ky from "ky";
import { err, ok } from "neverthrow";
import z from "zod";
import { simpleWorkflow } from "./simple-workflow";

const statusMessageSchema = z.object({
  type: z.literal("status"),
  data: z.object({
    sid: z.string().optional(),
    status: z.object({
      exec_info: z.object({
        queue_remaining: z.number(),
      }),
    }),
  }),
});

export type WebSocketStatusMessage = z.infer<typeof statusMessageSchema>;

type ComfyUIWebSocketListener = {
  onStatusMessage?: (statusMessage: WebSocketStatusMessage) => void;
}
export class ComfyUIWebSocket {
  private socket: WebSocket | undefined;
  private sessionId: string | undefined;
  private url: string;
  private listeners: ComfyUIWebSocketListener[] = [];

  public constructor(args: {
    url: string;
    sessionId?: string;
    eventHandlers: ComfyUIWebSocketListener;
  }) {
    this.listeners.push(args.eventHandlers);
    this.sessionId = args.sessionId;
    this.url = args.url;
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(`${this.url}/ws`);
    this.socket.binaryType = "arraybuffer";

    this.socket.addEventListener("open", () => {
      console.log("WebSocket is open");
    });

    this.socket.addEventListener("message", (event) => {
      if (event.data instanceof ArrayBuffer) {
        console.log("WS: Array Buffer received from server ", event.data);
      } else {
        const asJson = JSON.parse(event.data);
        const statusMessage = statusMessageSchema.safeParse(asJson);
        if (statusMessage.success) {
          if (statusMessage.data.data.sid) {
            this.sessionId = statusMessage.data.data.sid;
          }
          console.log("WS: Reveived status message", statusMessage.data);
          this.listeners.forEach((listener) => {
            if (listener.onStatusMessage) {
              listener.onStatusMessage(statusMessage.data);
            }
          });
        } else {
          console.log("WS: Failed to parse message", asJson);
        }
      }
    });
  }
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
