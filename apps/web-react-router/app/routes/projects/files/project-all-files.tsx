import { Button } from "@lro-ui/button";
import { call } from "@orpc/server";
import { appRouter } from "@repo/api";
import { Link } from "react-router";
import { AppRoutes } from "~/routes";
import type { Route } from "./+types/project-all-files";

export async function loader(args: Route.LoaderArgs) {
  const files = await call(appRouter.projects.files.list, {
    projectId: args.params.projectId,
  });
  return {
    files,
  };
}

export default function ProjectAllFiles(props: Route.ComponentProps) {
  return (
    <div>
      <div>Project all files ({props.loaderData.files.length})</div>
      <div>
        To import files go to{" "}
        <Button asChild>
          <Link to={AppRoutes.project.importTasks(props.params.projectId)}>Import tasks</Link>
        </Button>
      </div>
    </div>
  );
}
