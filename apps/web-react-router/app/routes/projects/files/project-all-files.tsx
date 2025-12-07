import { Button } from "@lro-ui/button";
import { Link } from "react-router";
import { AppRoutes } from "~/routes";
import type { Route } from "./+types/project-all-files";

export default function ProjectAllFiles(props: Route.ComponentProps) {
  return (
    <div>
      <div>Project all files</div>
      <div>
        To import files go to{" "}
        <Button asChild>
          <Link to={AppRoutes.project.importTasks(props.params.projectId)}>Import tasks</Link>
        </Button>
      </div>
    </div>
  );
}
