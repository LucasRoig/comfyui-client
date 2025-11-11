import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRevalidator } from "react-router";
import { orpc } from "~/@lib/orpc-client";

export function useCreateChildTemplateMutation() {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation(
    orpc.projects.templates.createChild.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.projects.templates.key(),
        });
        revalidator.revalidate();
      },
    }),
  );
}
