"use client";
import { Background, type IsValidConnection, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ComfyNodeDefinition } from "@repo/comfy-ui-api-client";
import { useCallback, useState } from "react";
import { match } from "ts-pattern";
import { v4 as uuidv4 } from "uuid";
import { ComfyNode } from "./comfy-node";
import { NodePickerCommand } from "./node-picker-command";
import type { IComfyNode } from "./node-types";
import { useFlowState } from "./use-flow-state";
import type { DBWorkflow } from "@repo/data-access";

const nodeTypes = {
  comfy: ComfyNode,
};

export function Flow({ workflow }: Readonly<{ workflow: DBWorkflow }>) {
  return (
    <ReactFlowProvider>
      <_Flow workflow={workflow} />
    </ReactFlowProvider>
  );
}

function _Flow({ workflow }: Readonly<{ workflow: DBWorkflow }>) {
  const [isNodePickerOpen, setIsNodePickerOpen] = useState(false);
  const { nodes, edges, onNodesChange, onEdgesChange, addNodes, onConnect, setReactFlowInstance } = useFlowState(workflow);
  const { getNodes, getEdges } = useReactFlow();

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
              ...(nodeDefinition.input.required ? Object.entries(nodeDefinition.input.required) : []),
              ...(nodeDefinition.input.optional ? Object.entries(nodeDefinition.input.optional) : []),
            ].map(([key, value]) => [
              key,
              match(value)
                .with({ kind: "STRING_ARRAY" }, (i) => ({
                  kind: i.kind,
                  value: i.options[0] ?? "",
                }))
                .with({ kind: "NUMBER_ARRAY" }, (i) => ({
                  kind: i.kind,
                  value: i.options[0]?.toString() ?? "",
                }))
                .with({ kind: "IMAGE_UPLOAD_COMBO" }, (i) => ({
                  kind: i.kind,
                  value: "",
                }))
                .with({ kind: "STRING" }, (i) => ({
                  kind: i.kind,
                  value: i.config?.default ?? "",
                }))
                .with({ kind: "INT" }, (i) => ({
                  kind: i.kind,
                  value: i.config?.default?.toString() ?? "",
                  controlAfterGenerate: i.config?.control_after_generate ? ("fixed" as const) : undefined,
                }))
                .with({ kind: "FLOAT" }, (i) => ({
                  kind: i.kind,
                  value: i.config.default?.toString() ?? "",
                }))
                .with({ kind: "FLOATS" }, (i) => ({
                  kind: i.kind,
                  value: i.config.default?.toString() ?? "",
                }))
                .with({ kind: "*" }, (i) => ({
                  kind: i.kind,
                  value: "",
                }))
                .with({ kind: "BOOLEAN" }, (i) => ({
                  kind: i.kind,
                  value: i.config.default ? ("true" as const) : ("false" as const),
                }))
                .with({ kind: "CUSTOM" }, (i) => ({
                  kind: i.kind,
                  value: "",
                }))
                .with({ kind: "NUMBER_ARRAY_COMBO" }, (i) => ({
                  kind: i.kind,
                  value: i.config.default?.toString() ?? "",
                }))
                .with({ kind: "STRING_ARRAY_COMBO" }, (i) => ({
                  kind: i.kind,
                  value: i.config.default?.toString() ?? "",
                }))
                .exhaustive(),
            ]),
          ),
        },
      },
    };
    addNodes(node);
  };

  const isValidConnection: IsValidConnection = useCallback(
    (connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const nodes = getNodes();
      const _edges = getEdges();
      const sourceNode = nodes.find((node) => node.id === connection.source) as IComfyNode;
      const targetNode = nodes.find((node) => node.id === connection.target) as IComfyNode;
      if (!sourceNode) {
        throw new Error("Source node not found");
      }
      if (!targetNode) {
        throw new Error("Target node not found");
      }
      const sourceIndex = Number.parseInt(connection.sourceHandle?.split("_")[1] ?? "");
      const targetName = connection.targetHandle?.replace("input_", "");
      if (Number.isNaN(sourceIndex) || !Number.isFinite(sourceIndex) || sourceIndex < 0) {
        throw new Error("Invalid source handle");
      }
      if (targetName === undefined) {
        throw new Error("Invalid target handle");
      }
      const sourceType = sourceNode.data.definition.output[sourceIndex];
      const targetInput = targetNode.data.definition.input.required?.[targetName]
        ?? targetNode.data.definition.input.optional?.[targetName];
      if (targetInput === undefined) {
        throw new Error("Target input not found");
      }
      const targetType = match(targetInput)
        .with({ kind: "CUSTOM"}, (i) => i.type)
        .otherwise(() => targetInput.kind);
      return sourceType === targetType;
    },
    [getNodes, getEdges],
  );

  return (
    <div className="w-full h-full">
      <NodePickerCommand isOpen={isNodePickerOpen} setIsOpen={setIsNodePickerOpen} onSelect={handleInsertNode} />
      <ReactFlow<IComfyNode>
        deleteKeyCode="Delete"
        zoomOnDoubleClick={false}
        isValidConnection={isValidConnection}
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
        onConnect={onConnect}
        onEdgesChange={(e) => {
          onEdgesChange(e);
        }}
        onInit={(instance) => {
          console.log("ON INIT", instance);
          setReactFlowInstance(instance);
        }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
