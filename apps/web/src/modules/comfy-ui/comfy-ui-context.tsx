"use client";
import { createWebsocket } from "@repo/comfy-ui-api-client";
import { createContext, useRef } from "react";
import { create, useStore } from "zustand";
import { devtools } from "zustand/middleware";

type State = {
  sessionId: string;
};

type Actions = {
  setSessionId: (sessionId: string) => void;
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
        sessionId: "",
        actions: {
          setSessionId: (sessionId: string) => {
            set({ sessionId }, undefined, { type: "setSessionId", sessionId });
          },
        },
      }),
      {
        enabled: process.env.NODE_ENV === "development",
      },
    ),
  );
};

const ComfyUiContext = createContext<undefined>(undefined);

export function ComfyUiContextProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const store = useRef(createComfyUiStore());
  const storeActions = useStore(store.current, (state) => state.actions);
  const websocketRef = useRef<ReturnType<typeof createWebsocket> | null>(null);
  if (websocketRef.current === null) {
    websocketRef.current = createWebsocket("ws://172.22.80.1:8000", {
      onStatusMessage: (statusMessage) => {
        storeActions.setSessionId(statusMessage.data.sid);
      },
    });
  }

  return <ComfyUiContext.Provider value={undefined}>{children}</ComfyUiContext.Provider>;
}
