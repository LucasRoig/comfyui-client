"use client";

import { Button } from "@lro-ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@lro-ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@lro-ui/popover";
import { cn } from "@lro-ui/utils";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelectedProject } from "./selected-project-context";
import { listAllProjectsAction } from "./server-actions/list-all-projects-action";

type PopoverTriggerProps = React.ComponentProps<typeof PopoverTrigger>;

type ProjectSwitcherProps = PopoverTriggerProps;

export function ProjectSwitcher(props: ProjectSwitcherProps) {
  const router = useRouter();
  const selectedProject = useSelectedProject();
  const [open, setOpen] = useState(false);

  const { data: projects } = useQuery({
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          // biome-ignore lint/a11y/useSemanticElements: <explanation>
          role="combobox"
          aria-expanded={open}
          aria-label="Select a project"
          className={cn("w-[200px] justify-between", props.className)}
        >
          {selectedProject ? selectedProject.projectName : "No project selected"}
          <ChevronsUpDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No profile found.</CommandEmpty>
            {projects?.map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() => {
                  router.push(`/projects/${p.id}`);
                  setOpen(false);
                }}
                className="text-sm"
              >
                {p.name}
                <Check className={cn("ml-auto", selectedProject?.projectId === p.id ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            ))}
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  // openCreateProfileModal();
                }}
              >
                <PlusCircle className="h-5 w-5" />
                Create Project
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
