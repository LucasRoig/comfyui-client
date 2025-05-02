"use client";

import { Button } from "@lro-ui/button";
import { QueueState } from "../modules/comfy-ui/queue-state";
import { queueWorkflowAction } from "../modules/comfy-ui/server-actions/queue-workflow-action";

export default function Home() {
  return (
    <div>
      Test
      <Button
        onClick={async () => {
          const response = await queueWorkflowAction();
          console.log(response);
        }}
      >
        Queue Workflow
      </Button>
      <QueueState />
    </div>
  );
}
