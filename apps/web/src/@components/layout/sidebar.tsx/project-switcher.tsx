"use client";

import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lro-ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@lro-ui/sidebar";
import { Skeleton } from "@lro-ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateProjectModal } from "../../../modules/project/create-project-modal";
import { useSelectedProject } from "../../../modules/project/selected-project-context";
import { listAllProjectsAction } from "../../../modules/project/server-actions/list-all-projects-action";

export function ProjectSwitcher() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await listAllProjectsAction();
      if (!response.data) {
        throw response;
      }
      return response.data;
    },
    throwOnError: true,
  });

  const { isMobile } = useSidebar();
  const activeProjectState = useSelectedProject();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div> */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                {activeProjectState?.selectedProject ? (
                  <span className="truncate font-medium">{activeProjectState.selectedProject.name}</span>
                ) : (
                  <span className="font-medium">Select a project</span>
                )}
                {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">Projects</DropdownMenuLabel>
            {isLoading ? (
              <Skeleton />
            ) : isError || !projects ? (
              <div>error</div>
            ) : projects.length === 0 ? (
              <div>No project</div>
            ) : (
              <>
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.name}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="gap-2 p-2"
                  >
                    {/* <div className="flex size-6 items-center justify-center rounded-md border">
                      <team.logo className="size-3.5 shrink-0" />
                    </div> */}
                    {project.name}
                    {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={() => setIsModalOpen(true)}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Create Project</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CreateProjectModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
