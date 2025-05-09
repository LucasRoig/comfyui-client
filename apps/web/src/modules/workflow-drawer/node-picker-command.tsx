import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "@lro-ui/command";

export function NodePickerCommand(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <CommandDialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <CommandInput placeholder="Insert a node..." />
      <CommandList>
        <CommandEmpty>No node found.</CommandEmpty>
      </CommandList>
    </CommandDialog>
  );
}
