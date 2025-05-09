import { Background, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export function Flow() {
  return (
    <div className="w-full h-full">
      <ReactFlow
        deleteKeyCode="Delete"
        zoomOnDoubleClick={false}
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
