"use client";

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
import { ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateProjectModal } from "../../../modules/project/create-project-modal";
import { useSelectedProject } from "../../../modules/project/selected-project-context";
import { orpc } from "../../../orpc/link";

export function ProjectSwitcher() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: projects, isLoading, isError } = useQuery(orpc.project.findAllProject.queryOptions());

  const { isMobile } = useSidebar();
  const activeProjectState = useSelectedProject();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
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
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">Create Project</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <CreateProjectModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
