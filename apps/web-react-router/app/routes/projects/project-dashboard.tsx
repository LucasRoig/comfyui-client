import type { Route } from "./+types/project-dashboard";

export default function ProjectDashboard(props: Route.ComponentProps) {
  return <div>{props.params.id}</div>;
}
