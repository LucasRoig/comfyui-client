"use client";
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ComfyNodeDefinition } from "@repo/comfy-ui-api-client";
import { useState } from "react";
import { match } from "ts-pattern";
import { v4 as uuidv4 } from "uuid";
import { ComfyNode } from "./comfy-node";
import { NodePickerCommand } from "./node-picker-command";
import type { IComfyNode } from "./node-types";
import { useFlowState } from "./use-flow-state";

const nodeTypes = {
  comfy: ComfyNode,
};

export function Flow() {
  return (
    <ReactFlowProvider>
      <_Flow />
    </ReactFlowProvider>
  );
}

function _Flow() {
  const [isNodePickerOpen, setIsNodePickerOpen] = useState(false);
  const { nodes, edges, onNodesChange, onEdgesChange, addNodes } = useFlowState();

  const handleInsertNode = (nodeDefinition: ComfyNodeDefinition) => {
    const node: IComfyNode = {
      id: uuidv4(),
      position: { x: 0, y: 0 },
      type: "comfy",
      data: {
        definition: nodeDefinition,
        state: {
          inputs: Object.fromEntries(
            [
              ...Object.entries(nodeDefinition.input.required),
              ...(nodeDefinition.input.optional ? Object.entries(nodeDefinition.input.optional) : []),
            ].map(([key, value]) => [
              key,
              match(value)
                .with({ kind: "STRING_ARRAY" }, (i) => i.options[0] ?? "")
                .with({ kind: "NUMBER_ARRAY" }, (i) => i.options[0]?.toString() ?? "")
                .with({ kind: "IMAGE_UPLOAD_COMBO" }, () => "")
                .with({ kind: "STRING" }, (i) => i.config.default ?? "")
                .with({ kind: "INT" }, (i) => i.config.default?.toString() ?? "")
                .with({ kind: "FLOAT" }, (i) => i.config.default?.toString() ?? "")
                .with({ kind: "FLOATS" }, (i) => i.config.default?.toString() ?? "")
                .with({ kind: "*" }, () => "")
                .with({ kind: "BOOLEAN" }, (i) => (i.config.default ? "true" : "false"))
                .with({ kind: "CUSTOM" }, () => "")
                .with({ kind: "NUMBER_ARRAY_COMBO" }, (i) => i.config.default?.toString() ?? "")
                .with({ kind: "STRING_ARRAY_COMBO" }, (i) => i.config.default?.toString() ?? "")
                .exhaustive(),
            ]),
          ),
        },
      },
    };
    addNodes(node);
  };
  return (
    <div className="w-full h-full">
      <NodePickerCommand isOpen={isNodePickerOpen} setIsOpen={setIsNodePickerOpen} onSelect={handleInsertNode} />
      <ReactFlow
        deleteKeyCode="Delete"
        zoomOnDoubleClick={false}
        onDoubleClick={() => setIsNodePickerOpen(true)}
        id="reactflow"
        selectionOnDrag={true}
        panOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={false}
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
