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

function useCreateChildTemplateMutation() {
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

export default function ProjectTemplates(props: Route.ComponentProps) {
  const createRootTemplateMutation = useCreateRootTemplateMutation();
  const handleCreateRootTemplate = () => {
    createRootTemplateMutation.mutate({
      projectId: props.params.id,
    });
  };
  const addChildMutation = useCreateChildTemplateMutation();
  const handleAddChild = (name: string, parentId: string) => {
    addChildMutation.mutate({
      projectId: props.params.id,
      name,
      parentId,
    });
  };
  return (
    <>
      <div>Project Templates</div>
      {props.loaderData.templatesTree === "EMPTY_TEMPLATE_LIST" ? (
        <Button onClick={handleCreateRootTemplate}>Create root template</Button>
      ) : (
        <TemplateCollapse templateTree={props.loaderData.templatesTree} onAddChild={handleAddChild} />
      )}
    </>
  );
}

function TemplateCollapse(props: {
  templateTree: Exclude<Route.ComponentProps["loaderData"]["templatesTree"], string>;
  onAddChild: (name: string, parentId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(props.templateTree.value.isRoot);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white border rounded-md p-2 flex items-center">
        <CollapsibleTrigger asChild>
          <Button size="icon" variant="text">
            <ChevronRightIcon className={cn("transition-transform", isOpen && "rotate-90")} />
          </Button>
        </CollapsibleTrigger>
        <div>{props.templateTree.value.name}</div>
        <Button className="ml-auto" onClick={() => props.onAddChild("test4", props.templateTree.value.id)}>
          <PlusIcon />
          Add child
        </Button>
      </div>
      <CollapsibleContent>
        <div className="ml-4 pl-2 pt-2 border-l flex flex-col gap-2">
          {props.templateTree.children.map((c) => (
            <TemplateCollapse templateTree={c} onAddChild={props.onAddChild} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
