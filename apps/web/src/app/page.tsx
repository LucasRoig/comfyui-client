"use client";

import { Button } from "@lro-ui/button";
import { useSessionId } from "../modules/comfy-ui/comfy-ui-context";
import { QueueState } from "../modules/comfy-ui/queue-state";
import { queueWorkflowAction } from "../modules/comfy-ui/server-actions/queue-workflow-action";

export default function Home() {
  const sessionId = useSessionId();
  return (
    <div>
      Test
      <Button
        onClick={async () => {
          if (!sessionId) {
            throw new Error("No session id");
          }
          const response = await queueWorkflowAction({
            sessionId,
          });
          console.log(response);
        }}
      >
        Queue Workflow
      </Button>
      <QueueState />
    </div>
  );
}
