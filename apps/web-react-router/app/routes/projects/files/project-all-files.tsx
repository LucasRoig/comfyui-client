import { Button } from "@lro-ui/button";
import { call } from "@orpc/server";
import { appRouter } from "@repo/api";
import { Link } from "react-router";
import { AppRoutes } from "~/routes";
import type { Route } from "./+types/project-all-files";

export async function loader(args: Route.LoaderArgs) {
  const rootTemplate = await call(appRouter.projects.templates.findRoot, {
    projectId: args.params.projectId,
  });
  return { rootTemplate };
}

export default function ProjectAllFiles(props: Route.ComponentProps) {
  if (!props.loaderData.rootTemplate) {
    return (
      <div>
        You need to create a root template before importing files
        <div>
          <Button asChild>
            <Link to={AppRoutes.project.templates(props.params.projectId)}>Go to templates</Link>
          </Button>
        </div>
      </div>
    );
  }
  return <div>Project all files</div>;
}
