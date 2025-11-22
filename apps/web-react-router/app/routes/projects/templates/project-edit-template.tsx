import { toast } from "@lro-ui/sonner";
import { call, ORPCError } from "@orpc/server";
import { appRouter, type RouterInputs } from "@repo/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
  const [layoutMap, setLayoutMap] = useState(
    new Map(props.loaderData.template.fields.map((field) => [field.id, field])),
  );
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
    return Array.from(layoutMap.values()).map((f) => ({
      i: f.id,
      x: f.x,
      y: f.y,
      w: f.width,
      h: f.height,
    }));
  }, [layoutMap]);

  const handleLayoutChange = (layouts: GridLayout.Layout[]) => {
    const newMap: typeof layoutMap = new Map();
    const mutationPayload: RouterInputs["projects"]["templates"]["updateFields"] = {
      templateId: props.params.templateId,
      fields: [],
    };
    for (const layout of layouts) {
      const previousValue = layoutMap.get(layout.i);
      if (!previousValue) {
        throw new Error(`Can't find template in layout map. id = "${layout.i}"`);
      }
      const newValue = {
        ...previousValue,
        x: layout.x,
        y: layout.y,
        width: layout.w,
        height: layout.h,
      };
      newMap.set(layout.i, newValue);
      if (
        newValue.x !== previousValue.x ||
        newValue.y !== previousValue.y ||
        newValue.width !== previousValue.width ||
        newValue.height !== previousValue.height
      ) {
        mutationPayload.fields.push(newValue);
      }
    }
    setLayoutMap(newMap);
    if (mutationPayload.fields.length > 0) {
      updateTemplateMutation.mutate(mutationPayload);
    }
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
