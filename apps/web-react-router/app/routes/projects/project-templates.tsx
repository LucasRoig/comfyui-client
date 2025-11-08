import { Button } from "@lro-ui/button";
import { call } from "@orpc/server";
import { appRouter } from "@repo/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRevalidator } from "react-router";
import { orpc } from "~/@lib/orpc-client";
import type { Route } from "./+types/project-templates";

export async function loader(args: Route.LoaderArgs) {
  const templates = await call(appRouter.projects.templates.list, {
    projectId: args.params.id,
  });
  return { templates };
}

function useCreateRootTemplateMutation() {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation(
    orpc.projects.templates.createRoot.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.projects.templates.key(),
        });
        revalidator.revalidate();
      },
    }),
  );
}

export default function ProjectTemplates(props: Route.ComponentProps) {
  const createRootTemplateMutation = useCreateRootTemplateMutation();
  const handleCreateRootTemplate = () => {
    createRootTemplateMutation.mutate({
      projectId: props.params.id,
    });
  };
  return (
    <>
      <div>Project Templates {props.loaderData.templates.length}</div>
      {props.loaderData.templates.length === 0 ? (
        <Button onClick={handleCreateRootTemplate}>Create root template</Button>
      ) : null}
    </>
  );
}
