"use client";

import { Button } from "@lro-ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@lro-ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@lro-ui/popover";
import { cn } from "@lro-ui/utils";
import { ChevronsUpDown, PlusCircle } from "lucide-react";
import { useState } from "react";

type PopoverTriggerProps = React.ComponentProps<typeof PopoverTrigger>;

type ProjectSwitcherProps = PopoverTriggerProps;

export function ProjectSwitcher(props: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          // biome-ignore lint/a11y/useSemanticElements: <explanation>
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className={cn("w-[200px] justify-between", props.className)}
        >
          No project selected
          <ChevronsUpDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No profile found.</CommandEmpty>
            {/* {profiles?.map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() => {
                  setSelectedProfile(p.id);
                  setOpen(false);
                }}
                className="text-sm"
              >
                {p.name}
                <Check className={cn("ml-auto", selectedProfile === p ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            ))} */}
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
