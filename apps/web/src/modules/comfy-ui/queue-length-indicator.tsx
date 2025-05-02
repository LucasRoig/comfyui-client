"use client";
import { useQueueState } from "./useQueueState";

export function QueueLengthIndicator() {
  const { data: queueState, isLoading } = useQueueState();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  const queueLength = (queueState?.data?.queue_running?.length ?? 0) + (queueState?.data?.queue_pending?.length ?? 0);
  return <div>Queue Length: {queueLength}</div>;
}
