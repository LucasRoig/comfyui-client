import ky from "ky";
import z from "zod";
import { getNodes } from "./api-routes/get-nodes";
import { getQueue } from "./api-routes/get-queue";
import { postPrompt } from "./api-routes/post-prompt";
export {
  type ComfyNodeDefinition,
  parsedInputDefinitionSchema,
  comfyApiInputDefinitionSchema,
} from "./api-routes/get-nodes";

export {
  postPromptRequestSchema,
  type PostPromptRequest,
} from "./api-routes/post-prompt";

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

const progressMessageSchema = z.object({
  type: z.literal("progress"),
  data: z.object({
    value: z.number(),
    max: z.number(),
    prompt_id: z.string(),
    node: z.string().nullable(),
  }),
});

const executingMessageSchema = z.object({
  type: z.literal("executing"),
  data: z.object({
    prompt_id: z.string(),
    node: z.string(),
    display_node: z.string(),
  }),
});

const executionSuccessMessageSchema = z.object({
  type: z.literal("execution_success"),
  data: z.object({
    prompt_id: z.string(),
    timestamp: z.number(),
  }),
});

const executedMessageSchema = z.object({
  type: z.literal("executed"),
  data: z.object({
    display_node: z.string(),
    prompt_id: z.string(),
    node: z.string(),
    output: z
      .object({
        images: z
          .array(
            z.object({
              filename: z.string(),
              subfolder: z.string(),
              type: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
  }),
});

export type WebSocketStatusMessage = z.infer<typeof statusMessageSchema>;
export type WebSocketProgressMessage = z.infer<typeof progressMessageSchema>;
export type WebSocketExecutingMessage = z.infer<typeof executingMessageSchema>;
export type WebSocketExecutedMessage = z.infer<typeof executedMessageSchema>;
export type WebSocketExecutionSuccessMessage = z.infer<typeof executionSuccessMessageSchema>;

type ComfyUIWebSocketListener = {
  id: string;
  onStatusMessage?: (statusMessage: WebSocketStatusMessage) => void;
  onProgressMessage?: (progressMessage: WebSocketProgressMessage) => void;
  onExecutingMessage?: (executingMessage: WebSocketExecutingMessage) => void;
  onExecutedMessage?: (executedMessage: WebSocketExecutedMessage) => void;
  onExecutionSuccessMessage?: (executionSuccessMessage: WebSocketExecutionSuccessMessage) => void;
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

  public addListener = (listener: ComfyUIWebSocketListener) => {
    this.listeners.push(listener);
  };

  public removeListener = (listenerId: string) => {
    this.listeners = this.listeners.filter((l) => l.id !== listenerId);
  };

  private sendLog = (type: string, message?: string) => {
    const date = new Date();
    this.listeners.forEach((l) => {
      if (l.onLog) {
        l.onLog({ type, date, message });
      }
    });
  };

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
        }
        const executionSuccessMessage = executionSuccessMessageSchema.safeParse(asJson);
        if (executionSuccessMessage.success) {
          if (debugWWebsocket) {
            console.log("WS: Reveived execution success message", executionSuccessMessage.data);
          }
          this.listeners.forEach((listener) => {
            if (listener.onExecutionSuccessMessage) {
              listener.onExecutionSuccessMessage(executionSuccessMessage.data);
            }
          });
        }
        const executingMessage = executingMessageSchema.safeParse(asJson);
        if (executingMessage.success) {
          if (debugWWebsocket) {
            console.log("WS: Reveived executing message", executingMessage.data);
          }
          this.listeners.forEach((listener) => {
            if (listener.onExecutingMessage) {
              listener.onExecutingMessage(executingMessage.data);
            }
          });
        }

        const executedMessage = executedMessageSchema.safeParse(asJson);
        if (executedMessage.success) {
          if (debugWWebsocket) {
            console.log("WS: Reveived executed message", executedMessage.data);
          }
          this.listeners.forEach((listener) => {
            if (listener.onExecutedMessage) {
              listener.onExecutedMessage(executedMessage.data);
            }
          });
        }

        const progressMessage = progressMessageSchema.safeParse(asJson);
        if (progressMessage.success) {
          if (debugWWebsocket) {
            console.log("WS: Reveived progress message", progressMessage.data);
          }
          this.listeners.forEach((listener) => {
            if (listener.onProgressMessage) {
              listener.onProgressMessage(progressMessage.data);
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
    getNodes: getNodes(api),
  };
}
