import ky from "ky";
import z from "zod";
import { getQueue } from "./api-routes/get-queue";
import { postPrompt } from "./api-routes/post-prompt";

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
  onClose?: () => void;
  onLog?: (log: ComfyUIWebSocketLog) => void;
};

export type ComfyUIWebSocketLog = {
  type: string;
  date: Date;
  message?: string;
};

const debugWWebsocket = false;
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

  private sendLog(type: string, message?: string) {
    const date = new Date();
    this.listeners.forEach((l) => {
      if (l.onLog) {
        l.onLog({ type, date, message });
      }
    });
  }

  private connect() {
    if (debugWWebsocket) {
      console.debug("Try to connect to websocket");
    }
    this.sendLog("INIT_CONNECTION");
    let existingSession = this.sessionId;
    if (existingSession) {
      existingSession = `?clientId=${existingSession}`;
    } else {
      existingSession = "";
    }

    this.socket = new WebSocket(`${this.url}/ws${existingSession}`);

    this.socket.binaryType = "arraybuffer";

    this.socket.addEventListener("open", () => {
      this.sendLog("SOCKET_CONNECTED");
      if (debugWWebsocket) {
        console.debug("WS: WebSocket is open");
      }
    });

    this.socket.addEventListener("close", () => {
      this.sendLog("SOCKET_CLOSED");
      this.listeners.forEach((listener) => {
        if (listener.onClose) {
          listener.onClose();
        }
      });
      this.socket = undefined;
      setTimeout(() => {
        this.connect();
      }, 1000);
      if (debugWWebsocket) {
        console.debug("WS: WebSocket is closed");
      }
    });

    this.socket.addEventListener("message", (event) => {
      if (event.data instanceof ArrayBuffer) {
        this.sendLog("SOCKET_BINARY_MESSAGE_RECEIVED");
        if (debugWWebsocket) {
          console.debug("WS: Array Buffer received from server ", event.data);
        }
      } else {
        const asJson = JSON.parse(event.data);
        this.sendLog("SOCKET_MESSAGE_RECEIVED", asJson);
        const statusMessage = statusMessageSchema.safeParse(asJson);
        if (statusMessage.success) {
          if (statusMessage.data.data.sid) {
            this.sessionId = statusMessage.data.data.sid;
          }
          if (debugWWebsocket) {
            console.log("WS: Reveived status message", statusMessage.data);
          }
          this.listeners.forEach((listener) => {
            if (listener.onStatusMessage) {
              listener.onStatusMessage(statusMessage.data);
            }
          });
        } else {
          if (debugWWebsocket) {
            console.log("WS: Failed to parse message", asJson);
          }
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
    queueWorkflow: postPrompt(api),
    getQueue: getQueue(api),
  };
}
