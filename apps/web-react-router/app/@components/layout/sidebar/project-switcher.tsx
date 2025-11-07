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
import type { RouterOutputs } from "@repo/api";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AppRoutes } from "~/routes";
import { CreateProjectModal } from "../../../modules/projects/create-project-modal";

export type ProjectSwitcherProps = {
  allProjects: RouterOutputs["projects"]["list"];
  currentProject: RouterOutputs["projects"]["list"][number];
};

export function ProjectSwitcher(props: ProjectSwitcherProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isMobile } = useSidebar();

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
                  <span className="truncate font-medium">{props.currentProject.name}</span>
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
              {props.allProjects.length === 0 ? (
                <div>No project</div>
              ) : (
                <>
                  {props.allProjects.map((project) => (
                    <DropdownMenuItem
                      key={project.name}
                      onClick={() => navigate(AppRoutes.project.dashboard(project.id))}
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
