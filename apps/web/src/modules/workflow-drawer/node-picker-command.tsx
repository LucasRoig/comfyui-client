import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList, CommandLoading } from "@lro-ui/command";
import { useQuery } from "@tanstack/react-query";
import { getNodesAction } from "../comfy-ui/server-actions/get-nodes-action";

export function NodePickerCommand(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { data: nodes, isLoading } = useQuery({
    queryKey: ["comfy-ui", "nodes"],
    queryFn: () => getNodesAction(),
    throwOnError: true,
  });
  return (
    <CommandDialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <CommandInput placeholder="Insert a node..." />
      <CommandList>
        {isLoading ? <CommandLoading /> : <CommandEmpty>No node found.</CommandEmpty>}
        {nodes?.data &&
          Object.values(nodes.data).map((node) => <CommandItem key={node.name}>{node.display_name}</CommandItem>)}
      </CommandList>
    </CommandDialog>
  );
}
