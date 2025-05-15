"use client";
import { Button } from "@lro-ui/button";
import { useMutation } from "@tanstack/react-query";
import { createWorkflowAction } from "../../modules/workflow-drawer/server-actions/create-workflow-action";

export default function WorkflowPage() {
  const createWorkflowMutation = useMutation({
    mutationFn: () => {
      return createWorkflowAction();
    },
    onSuccess: (result) => {
      console.log(result?.data?.id)
    }
  })
  const handleCreateWorkflow = () => {
    createWorkflowMutation.mutate();
  }
  return <div>
    <Button onClick={handleCreateWorkflow} disabled={createWorkflowMutation.isPending}>Create workflow</Button>
  </div>;
}
