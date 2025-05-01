"use client";
import { useIsSocketConnected } from "./comfy-ui-context";

export function SocketConnectedIndicator() {
  const isSocketConnected = useIsSocketConnected();
  return <div>{isSocketConnected ? "Socket Connected" : "Socket Disconnected"}</div>;
}
