import type { PostPromptRequest } from "@repo/comfy-ui-api-client";
import type { DBWorkflow } from "@repo/data-access";
import { useMutation } from "@tanstack/react-query";
import {
  type Edge,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import { match } from "ts-pattern";
import { v4 as uuid } from "uuid";
import { useDebounce } from "../../@lib/use-debounce";
import { useSessionId, useWebSocketMethods } from "../comfy-ui/comfy-ui-context";
import { queueWorkflowAction } from "../comfy-ui/server-actions/queue-workflow-action";
import type { IComfyNode } from "./node-types";
import { createPromptAction } from "./server-actions/create-prompt-action";
import { downloadOutputAction } from "./server-actions/dowload-output-action";
import { updateWorkflowAction } from "./server-actions/update-workflow-action";

export function useFlowState(initialWorkflow: DBWorkflow) {
  const [nodes, setNodes] = useState<IComfyNode[]>(initialWorkflow.json.nodes);
  const [edges, setEdges] = useState<Edge[]>(initialWorkflow.json.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<IComfyNode>>();
  const websocket = useWebSocketMethods();
  const clientId = useSessionId();
  const { updateNodeData } = useReactFlow<IComfyNode>();
  const updateNodeInternals = useUpdateNodeInternals();

  const postPromptMutation = useMutation({
    throwOnError: true,
    mutationFn: async () => {
      if (clientId === undefined) {
        throw new Error("Client id is undefined");
      }
      const request: PostPromptRequest = {
        client_id: clientId,
        prompt: {},
      };
      for (const node of nodes) {
        const incomingEdges = edges.filter((edge) => edge.target === node.id);
        request.prompt[node.id] = {
          class_type: node.data.definition.name,
          inputs: {},
        };
        for (const [inputName] of [
          ...Object.entries(node.data.definition.input.required ?? {}),
          ...Object.entries(node.data.definition.input.optional ?? {}),
        ]) {
          const incomingEdge = incomingEdges.find((edge) => edge.targetHandle === `input_${inputName}`);
          const state = node.data.state.inputs[inputName];
          if (incomingEdge) {
            const sourceOutputIndex = Number.parseInt(incomingEdge.sourceHandle!.replace("output_", ""));
            if (Number.isNaN(sourceOutputIndex) || !Number.isFinite(sourceOutputIndex)) {
              throw new Error(
                `Invalid source output index, nodeName: ${node.data.definition.name}, nodeId: ${node.id}, inputName: ${inputName}`,
              );
            }
            request.prompt[node.id]!.inputs[inputName] = [incomingEdge.source, sourceOutputIndex];
          } else if (state) {
            const value = match(state.kind)
              .with("STRING", () => state.value)
              .with("INT", () => Number.parseInt(state.value))
              .with("FLOAT", () => Number.parseFloat(state.value))
              .with("FLOATS", () => state.value)
              .with("*", () => state.value)
              .with("BOOLEAN", () => state.value)
              .with("CUSTOM", () => state.value)
              .with("NUMBER_ARRAY", () =>
                state.value.includes(",") || state.value.includes(".")
                  ? Number.parseFloat(state.value)
                  : Number.parseInt(state.value),
              )
              .with("STRING_ARRAY", () => state.value)
              .with("IMAGE_UPLOAD_COMBO", () => state.value)
              .with("NUMBER_ARRAY_COMBO", () => state.value)
              .with("STRING_ARRAY_COMBO", () => state.value)
              .exhaustive();
            request.prompt[node.id]!.inputs[inputName] = value;
          }
        }
      }

      const response = await queueWorkflowAction(request);
      const promptId = response?.data?.prompt_id;
      console.log("promptId is :", promptId);
      if (promptId !== undefined) {
        console.log("adding listener");
        const listenerId = uuid();
        websocket.addListener({
          id: listenerId,
          onExecutedMessage(executedMessage) {
            if (executedMessage.data.prompt_id === promptId) {
              console.log("executed", executedMessage);
              for (const image of executedMessage.data.output?.images ?? []) {
                downloadOutputAction({
                  comfy: {
                    filename: image.filename,
                    subfolder: image.subfolder,
                    type: image.type,
                  },
                  nodeId: executedMessage.data.node,
                  promptId,
                });
              }
              updateNodeData(executedMessage.data.node, {
                executionOutput: {
                  images: executedMessage.data.output?.images?.map((i) => ({
                    comfy: i,
                  })),
                },
              });
              updateNodeInternals(executedMessage.data.node);
            }
          },
          onExecutionSuccessMessage(executionSuccessMessage) {
            if (executionSuccessMessage.data.prompt_id === promptId) {
              websocket.removeListener(listenerId);
              console.log("removed listener", listenerId);
            }
          },
        });
        createPromptAction({
          promptId,
          workflowId: initialWorkflow.id,
          json: {
            edges,
            nodes,
          },
        });
        console.log("added listener", listenerId);
      }
    },
  });

  const persistWorkflowMutation = useMutation({
    mutationFn: (json: unknown) => {
      return updateWorkflowAction({
        id: initialWorkflow.id,
        json,
      });
    },
    onSuccess: (_result) => {
      console.log("saved workflow");
    },
  });

  const debouncedPersistWorkflow = useDebounce(persistWorkflowMutation.mutate, 5000);

  const { getNodes: _getNodes, getEdges: _getEdges, addNodes, addEdges } = useReactFlow();

  const onNodesChange: OnNodesChange<IComfyNode> = useCallback(
    (changes) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);
        if (reactFlowInstance) {
          const currentSchema = reactFlowInstance.toObject();
          console.log("ON NODES CHANGE", newNodes);
          debouncedPersistWorkflow({
            edges: currentSchema.edges,
            nodes: newNodes,
          });
        } else {
          console.warn("reactFlowInstance is undefined");
        }
        return newNodes;
      });
    },
    [reactFlowInstance, debouncedPersistWorkflow],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        if (reactFlowInstance) {
          const currentSchema = reactFlowInstance.toObject();
          debouncedPersistWorkflow({
            edges: newEdges,
            nodes: currentSchema.nodes,
          });
        } else {
          console.warn("reactFlowInstance is undefined");
        }
        return newEdges;
      }),
    [reactFlowInstance, debouncedPersistWorkflow],
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      addEdges([{ ...params, id: uuid(), animated: true }]);
    },
    [addEdges],
  );

  return {
    nodes,
    edges,
    addNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setReactFlowInstance,
    postPrompt: () => postPromptMutation.mutate(),
  };
}
