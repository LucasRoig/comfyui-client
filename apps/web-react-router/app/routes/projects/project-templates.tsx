import { call } from "@orpc/server";
import { appRouter } from "@repo/api";
import type { Route } from "./+types/project-templates";

export async function loader(args: Route.LoaderArgs) {
  const templates = await call(appRouter.projects.templates.list, {
    projectId: args.params.id,
  });
  return { templates };
}
export default function ProjectTemplates(props: Route.ComponentProps) {
  return <div>Project Templates {props.loaderData.templates.length}</div>;
}
