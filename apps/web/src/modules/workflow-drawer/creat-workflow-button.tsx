"use client";
import { Button } from "@lro-ui/button";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createWorkflowAction } from "./server-actions/create-workflow-action";

export function CreateWorkflowButton() {
  const router = useRouter();
  const createWorkflowMutation = useMutation({
    mutationFn: () => {
      return createWorkflowAction();
    },
    onSuccess: (result) => {
      router.push(`/workflow/${result?.data?.id}`);
      console.log(result?.data?.id);
    },
  });
  const handleCreateWorkflow = () => {
    createWorkflowMutation.mutate();
  };
  return (
    <Button onClick={handleCreateWorkflow} disabled={createWorkflowMutation.isPending}>
      Create workflow
    </Button>
  );
}
