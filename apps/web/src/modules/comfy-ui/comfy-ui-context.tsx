"use client";
import { ComfyUIWebSocket, type WebSocketStatusMessage } from "@repo/comfy-ui-api-client";
import { createContext, useContext, useRef } from "react";
import { create, useStore } from "zustand";
import { devtools } from "zustand/middleware";

const initialState = {
  sessionId: undefined as string | undefined,
  queueLength: 0,
  socketConnected: false,
};
type State = typeof initialState;

type Actions = {
  onStatusMessage: (statusMessage: WebSocketStatusMessage) => void;
  onWebSocketClosed: () => void;
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
              (currentState) => ({
                sessionId: message.data.sid ?? currentState.sessionId,
                socketConnected: true,
                queueLength: message.data.status.exec_info.queue_remaining,
              }),
              undefined,
              { type: "onStatusMessage", message },
            );
          },
          onWebSocketClosed: () => {
            set(() => ({
              socketConnected: false,
              queueLength: 0,
            }), undefined, { type: "onWebsocketClosed" });
          }
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
  if (websocketRef.current === null) {
    websocketRef.current = new ComfyUIWebSocket({
      url: "ws://172.22.80.1:8000",
      eventHandlers: {
        onStatusMessage: storeActions.onStatusMessage,
        onClose: storeActions.onWebSocketClosed,
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

export const useQueueLength = () => {
  return useComfyUiStore((state) => state.queueLength);
};
