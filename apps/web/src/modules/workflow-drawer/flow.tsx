"use client";
import { Background, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useState } from "react";
import { NodePickerCommand } from "./node-picker-command";

export function Flow() {
  const [isNodePickerOpen, setIsNodePickerOpen] = useState(false);
  return (
    <div className="w-full h-full">
      <NodePickerCommand isOpen={isNodePickerOpen} setIsOpen={setIsNodePickerOpen} />
      <ReactFlow
        deleteKeyCode="Delete"
        zoomOnDoubleClick={false}
        onDoubleClick={() => setIsNodePickerOpen(true)}
        id="reactflow"
        selectionOnDrag={true}
        panOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={false}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
