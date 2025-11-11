import { Button } from "@lro-ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@lro-ui/collapsible";
import { cn } from "@lro-ui/utils";
import { call } from "@orpc/server";
import { appRouter } from "@repo/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRightIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useRevalidator } from "react-router";
import { orpc } from "~/@lib/orpc-client";
import { CreateChildTemplateModal } from "~/modules/projects/create-child-template-modal";
import type { Route } from "./+types/project-templates";

export async function loader(args: Route.LoaderArgs) {
  const templatesTree = await call(appRouter.projects.templates.tree, {
    projectId: args.params.id,
  });
  return { templatesTree };
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
      <div>Project Templates</div>
      {props.loaderData.templatesTree === "EMPTY_TEMPLATE_LIST" ? (
        <Button onClick={handleCreateRootTemplate}>Create root template</Button>
      ) : (
        <TemplateCollapse templateTree={props.loaderData.templatesTree} projectId={props.params.id} />
      )}
    </>
  );
}

function TemplateCollapse(props: {
  templateTree: Exclude<Route.ComponentProps["loaderData"]["templatesTree"], string>;
  projectId: string;
}) {
  const [isOpen, setIsOpen] = useState(props.templateTree.value.isRoot);
  const [isCreateChildTemplateModalOpen, setIsCreateChildTemplateModalOpen] = useState(false);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CreateChildTemplateModal
        isOpen={isCreateChildTemplateModalOpen}
        onOpenChange={setIsCreateChildTemplateModalOpen}
        parentId={props.templateTree.value.id}
        projectId={props.projectId}
      />
      <div className="bg-white border rounded-md p-2 flex items-center">
        <CollapsibleTrigger asChild>
          <Button size="icon" variant="text">
            <ChevronRightIcon className={cn("transition-transform", isOpen && "rotate-90")} />
          </Button>
        </CollapsibleTrigger>
        <div>{props.templateTree.value.name}</div>
        <Button className="ml-auto" onClick={() => setIsCreateChildTemplateModalOpen(true)}>
          <PlusIcon />
          Add child
        </Button>
      </div>
      <CollapsibleContent>
        <div className="ml-4 pl-2 pt-2 border-l flex flex-col gap-2">
          {props.templateTree.children.map((c) => (
            <TemplateCollapse templateTree={c} projectId={props.projectId} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
