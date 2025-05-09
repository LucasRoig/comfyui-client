import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./base-node";
import type { IComfyNode } from "./node-types";

export function ComfyNode(props: NodeProps<IComfyNode>) {
  return (
    <BaseNode className="flex flex-col p-0" selected={false}>
      <div className="border-b px-5 py-2 text-center font-medium">{props.data.definition.display_name}</div>
    </BaseNode>
  );
}
