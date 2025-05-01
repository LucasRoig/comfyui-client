"use client";
import { useQueueLength } from "./comfy-ui-context";

export function QueueLengthIndicator() {
  const queueLength = useQueueLength();
  return <div>Queue Length: {queueLength}</div>;
}
