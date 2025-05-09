import type { ComfyNodeDefinition } from "@repo/comfy-ui-api-client";
import type { Node } from "@xyflow/react";

export type IComfyNode = Node<{
  definition: ComfyNodeDefinition;
}>;
