"use client";
import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ComfyNodeDefinition } from "@repo/comfy-ui-api-client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ComfyNode } from "./comfy-node";
import { NodePickerCommand } from "./node-picker-command";
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
    addNodes({
      id: uuidv4(),
      position: { x: 0, y: 0 },
      type: "comfy",
      data: {
        definition: nodeDefinition,
      },
    });
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
