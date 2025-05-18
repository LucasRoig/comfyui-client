"use client";
import { toast } from "@lro-ui/sonner";
import {
  ComfyUIWebSocket,
  type ComfyUIWebSocketLog,
  type WebSocketExecutingMessage,
  type WebSocketExecutionSuccessMessage,
  type WebSocketProgressMessage,
  type WebSocketStatusMessage,
} from "@repo/comfy-ui-api-client";
import { createContext, useContext, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { create, useStore } from "zustand";
import { devtools } from "zustand/middleware";
import { newExecutionState, onExecutingMessage, onExecutionSucessMessage, onProgressMessage } from "./execution-state";
import { useInvalidateQueueState } from "./useQueueState";

const initialState = {
  executionState: newExecutionState(),
  webSocketLogs: [] as ComfyUIWebSocketLog[],
  sessionId: undefined as string | undefined,
  socketConnected: false,
  progressMap: {} as Record<string, WebSocketProgressMessage["data"]>,
};
type State = typeof initialState;

type Actions = {
  onStatusMessage: (statusMessage: WebSocketStatusMessage) => void;
  onProgressMessage: (progressMessage: WebSocketProgressMessage) => void;
  onExecutingMessage: (executingMessage: WebSocketExecutingMessage) => void;
  onExecutionSucessMessage: (message: WebSocketExecutionSuccessMessage) => void;
  onWebSocketClosed: () => void;
  onWebSocketLog: (log: ComfyUIWebSocketLog) => void;
};

type StoreState = State & {
  actions: Actions;
};

// We can pass initial data in args if necessary
// biome-ignore lint/complexity/noBannedTypes: <explanation>
const createComfyUiStore = (_args: {} = {}) => {
  return create<StoreState>()(
    devtools(
      (set, _get): StoreState => ({
        ...initialState,
        actions: {
          onStatusMessage: (message) => {
            set(
              (currentState) => {
                if (!currentState.socketConnected) {
                  toast.info("WebSocket connected");
                }
                return {
                  sessionId: message.data.sid ?? currentState.sessionId,
                  socketConnected: true,
                };
              },
              undefined,
              { type: "onStatusMessage", message },
            );
          },
          onWebSocketClosed: () => {
            set(
              (currentState) => {
                if (currentState.socketConnected) {
                  toast.error("WebSocket disconnected");
                }
                return {
                  socketConnected: false,
                  queueLength: 0,
                };
              },
              undefined,
              { type: "onWebsocketClosed" },
            );
          },
          onExecutionSucessMessage: (message) => {
            set(
              (currentState) => {
                return {
                  executionState: onExecutionSucessMessage(currentState.executionState, message),
                };
              },
              undefined,
              { type: "onExecutedMessage", message },
            );
          },
          onExecutingMessage: (message) => {
            set(
              (currentState) => {
                return {
                  executionState: onExecutingMessage(currentState.executionState, message),
                };
              },
              undefined,
              { type: "onExecutingMessage", message },
            );
          },
          onProgressMessage: (message) => {
            set(
              (currentState) => {
                return {
                  progressMap: {
                    ...currentState.progressMap,
                    [message.data.prompt_id]: message.data,
                  },
                  executionState: onProgressMessage(currentState.executionState, message),
                };
              },
              undefined,
              { type: "onProgressMessage", message },
            );
          },
          onWebSocketLog: (log) => {
            set(
              (currentState) => {
                const newLogs = [log, ...currentState.webSocketLogs];
                if (newLogs.length > 1000) {
                  newLogs.splice(newLogs.length - 250, 250);
                }
                return {
                  webSocketLogs: newLogs,
                };
              },
              undefined,
              { type: "onWebSocketLog", log },
            );
          },
        },
      }),
      {
        enabled: process.env.NODE_ENV === "development",
      },
    ),
  );
};

type ComfyUiStore = ReturnType<typeof createComfyUiStore>;

const ComfyUiContext = createContext<
  | {
      store: ComfyUiStore;
      addListener: ComfyUIWebSocket["addListener"];
      removeListener: ComfyUIWebSocket["removeListener"];
    }
  | undefined
>(undefined);

export function ComfyUiContextProvider({ children, wsUrl }: Readonly<{ children: React.ReactNode; wsUrl: string }>) {
  const store = useRef(createComfyUiStore());
  const storeActions = useStore(store.current, (state) => state.actions);
  const websocketRef = useRef<ComfyUIWebSocket | null>(null);
  const invalidateQueueState = useInvalidateQueueState();
  if (websocketRef.current === null) {
    websocketRef.current = new ComfyUIWebSocket({
      url: wsUrl,
      eventHandlers: {
        id: uuidv4(),
        onStatusMessage: (msg) => {
          invalidateQueueState();
          storeActions.onStatusMessage(msg);
        },
        onProgressMessage: (msg) => {
          storeActions.onProgressMessage(msg);
        },
        onExecutingMessage: (msg) => {
          storeActions.onExecutingMessage(msg);
        },
        onExecutionSuccessMessage: (msg) => {
          storeActions.onExecutionSucessMessage(msg);
        },
        onClose: () => {
          storeActions.onWebSocketClosed();
        },
        onLog: storeActions.onWebSocketLog,
      },
    });
  }

  return (
    <ComfyUiContext.Provider
      value={{
        store: store.current,
        addListener: websocketRef.current.addListener,
        removeListener: websocketRef.current.removeListener,
      }}
    >
      {children}
    </ComfyUiContext.Provider>
  );
}

function useComfyUiStore<T>(selector: (state: StoreState) => T): T {
  const context = useContext(ComfyUiContext);
  if (context === undefined) {
    throw new Error("useComfyUiStore must be used within a ComfyUiContextProvider");
  }
  return useStore(context.store, selector);
}

export const useWebSocketMethods = () => {
  const context = useContext(ComfyUiContext);
  if (context === undefined) {
    throw new Error("useWebSocketMethods must be used within a ComfyUiContextProvider");
  }
  return {
    addListener: context.addListener,
    removeListener: context.removeListener,
  };
};

export const useIsSocketConnected = () => {
  return useComfyUiStore((state) => state.socketConnected);
};

export const useWebsocketLogs = () => {
  return useComfyUiStore((state) => state.webSocketLogs);
};

export const useProgressMap = () => {
  return useComfyUiStore((state) => state.progressMap);
};

export const useSessionId = () => {
  return useComfyUiStore((state) => state.sessionId);
};

export const useExecutionState = () => {
  return useComfyUiStore((state) => state.executionState);
};
