import { SidebarInset, SidebarProvider } from "@lro-ui/sidebar";
import { call } from "@orpc/server";
import { appRouter } from "@repo/api";
import { Outlet } from "react-router";
import { AppSidebar } from "~/@components/layout/sidebar/app-sidebar";
import type { Route } from "./+types/project-layout";

export async function loader(props: Route.LoaderArgs) {
  const allProjects = await call(appRouter.projects.list, {});
  const currentProject = allProjects.find((p) => p.id === props.params.id);
  if (!currentProject) {
    throw new Error(`can't find project ${props.params.id}`);
  }
  return {
    allProjects,
    currentProject,
  };
}

export default function ProjectLayout(props: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar allProjects={props.loaderData.allProjects} currentProject={props.loaderData.currentProject} />
      <SidebarInset>
        <div className="flex flex-col min-h-dvh h-dvh">
          <main className="grow">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
