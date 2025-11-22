import { toast } from "@lro-ui/sonner";
import { call, ORPCError } from "@orpc/server";
import { appRouter } from "@repo/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import GridLayout from "react-grid-layout";
import { data } from "react-router";
import { orpc } from "~/@lib/orpc-client";
import type { Route } from "./+types/project-edit-template";

export async function loader(args: Route.LoaderArgs) {
  const template = await call(appRouter.projects.templates.getById, {
    templateId: args.params.templateId,
  }).catch((e) => {
    if (e instanceof ORPCError) {
      throw data(e.message, { status: e.status });
    }
    throw e;
  });
  return {
    template,
  };
}

export default function ProjectEditTemplatePage(props: Route.ComponentProps) {
  const queryClient = useQueryClient();
  const updateTemplateMutation = useMutation(
    orpc.projects.templates.updateFields.mutationOptions({
      onSuccess: () => {
        toast.success("Template saved");
        queryClient.invalidateQueries({
          queryKey: orpc.projects.templates.key(),
        });
      },
    }),
  );
  const layout = useMemo(() => {
    const fields = props.loaderData.template.fields;
    return fields.map((f) => ({
      i: f.id,
      x: f.x,
      y: f.y,
      w: f.width,
      h: f.height,
    }));
  }, [props.loaderData.template.fields]);

  const handleLayoutChange = (layout: GridLayout.Layout[]) => {
    updateTemplateMutation.mutate({
      templateId: props.params.templateId,
      fields: layout.map((f) => ({
        height: f.h,
        width: f.w,
        id: f.i,
        x: f.x,
        y: f.y,
      })),
    });
  };

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={3}
      rowHeight={100}
      width={1200}
      onLayoutChange={handleLayoutChange}
    >
      {props.loaderData.template.fields.map((f) => (
        <div key={f.id} className="border p-2">
          {f.fieldLabel}
        </div>
      ))}
    </GridLayout>
  );
}
