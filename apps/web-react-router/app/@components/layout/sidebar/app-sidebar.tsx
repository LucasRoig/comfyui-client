"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@lro-ui/sidebar";
import type { RouterOutputs } from "@repo/api";
import { Files, SquareTerminal } from "lucide-react";
import type * as React from "react";
import { AppRoutes } from "~/routes";
import { NavMain } from "./nav-main";
// import { NavProjects } from "./nav-projects";
import { ProjectSwitcher } from "./project-switcher";

type AppSidebarProps = {
  allProjects: RouterOutputs["projects"]["list"];
  currentProject: RouterOutputs["projects"]["list"][number];
} & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ allProjects, currentProject, ...props }: AppSidebarProps) {
  const data = {
    navMain: [
      {
        title: "Files",
        url: "#",
        icon: Files,
        isActive: true,
        items: [
          {
            title: "All files",
            url: AppRoutes.project.allFiles(currentProject.id),
          },
          {
            title: "Import Tasks",
            url: AppRoutes.project.importTasks(currentProject.id),
          },
        ],
      },
      {
        title: "Main things",
        url: "#",
        icon: SquareTerminal,
        isActive: false,
        items: [
          {
            title: "Workflow",
            url: AppRoutes.project.workflows(currentProject.id),
          },
          {
            title: "Explore civit",
            url: AppRoutes.project.exploreCivit(currentProject.id),
          },
        ],
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher allProjects={allProjects} currentProject={currentProject} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
        {/* <SocketConnectedIndicator /> */}
        {/* <QueueLengthIndicator /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
