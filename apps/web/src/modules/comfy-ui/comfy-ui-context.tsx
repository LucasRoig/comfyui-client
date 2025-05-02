"use client";
import { toast } from "@lro-ui/sonner";
import { ComfyUIWebSocket, type ComfyUIWebSocketLog, type WebSocketStatusMessage } from "@repo/comfy-ui-api-client";
import { createContext, useContext, useRef } from "react";
import { create, useStore } from "zustand";
import { devtools } from "zustand/middleware";
import { useInvalidateQueueState } from "./useQueueState";

const initialState = {
  webSocketLogs: [] as ComfyUIWebSocketLog[],
  sessionId: undefined as string | undefined,
  socketConnected: false,
};
type State = typeof initialState;

type Actions = {
  onStatusMessage: (statusMessage: WebSocketStatusMessage) => void;
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

const ComfyUiContext = createContext<ComfyUiStore | undefined>(undefined);

export function ComfyUiContextProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const store = useRef(createComfyUiStore());
  const storeActions = useStore(store.current, (state) => state.actions);
  const websocketRef = useRef<ComfyUIWebSocket | null>(null);
  const invalidateQueueState = useInvalidateQueueState();
  if (websocketRef.current === null) {
    websocketRef.current = new ComfyUIWebSocket({
      url: "ws://172.22.80.1:8000",
      eventHandlers: {
        onStatusMessage: (msg) => {
          invalidateQueueState();
          storeActions.onStatusMessage(msg);
        },
        onClose: () => {
          storeActions.onWebSocketClosed();
        },
        onLog: storeActions.onWebSocketLog,
      },
    });
  }

  return <ComfyUiContext.Provider value={store.current}>{children}</ComfyUiContext.Provider>;
}

function useComfyUiStore<T>(selector: (state: StoreState) => T): T {
  const store = useContext(ComfyUiContext);
  if (store === undefined) {
    throw new Error("useComfyUiStore must be used within a ComfyUiContextProvider");
  }
  return useStore(store, selector);
}

export const useIsSocketConnected = () => {
  return useComfyUiStore((state) => state.socketConnected);
};

export const useWebsocketLogs = () => {
  return useComfyUiStore((state) => state.webSocketLogs);
};
