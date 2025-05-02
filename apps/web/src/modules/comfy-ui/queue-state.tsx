"use client";

import { useQueueState } from "./useQueueState";

export function QueueState() {
  const { data: queueState, isLoading } = useQueueState();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h2>Queue State</h2>
      <h3>Running jobs : {queueState?.data?.queue_running?.length}</h3>
      <ul>
        {queueState?.data?.queue_running?.map((job) => (
          <li key={job.promptId}>{job.promptId}</li>
        ))}
      </ul>
      <h3>Pending jobs : {queueState?.data?.queue_pending?.length}</h3>
      <ul>
        {queueState?.data?.queue_pending?.map((job) => (
          <li key={job.promptId}>{job.promptId}</li>
        ))}
      </ul>
    </div>
  );
}
