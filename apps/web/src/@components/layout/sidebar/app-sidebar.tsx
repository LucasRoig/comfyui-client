"use client";

import { Files, SquareTerminal } from "lucide-react";
import type * as React from "react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@lro-ui/sidebar";
import { QueueLengthIndicator } from "../../../modules/comfy-ui/queue-length-indicator";
import { SocketConnectedIndicator } from "../../../modules/comfy-ui/socket-connected-indicator";
import { useSelectedProject } from "../../../modules/project/selected-project-context";
import { NavMain } from "./nav-main";
// import { NavProjects } from "./nav-projects";
import { ProjectSwitcher } from "./project-switcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const selectedProjectState = useSelectedProject();
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
            url: `/projects/${selectedProjectState?.selectedProject?.id}/files`,
          },
          {
            title: "Import Tasks",
            url: `/projects/${selectedProjectState?.selectedProject?.id}/import-tasks`,
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
            url: `/projects/${selectedProjectState?.selectedProject?.id}/workflow`,
          },
          {
            title: "Explore civit",
            url: `/projects/${selectedProjectState?.selectedProject?.id}/explore/civit`,
          },
        ],
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {selectedProjectState?.selectedProject ? (
          <>
            <NavMain items={data.navMain} />
            {/* <NavProjects projects={data.projects} /> */}
          </>
        ) : (
          <>Start by selecting a project</>
        )}
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
        <SocketConnectedIndicator />
        <QueueLengthIndicator />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
