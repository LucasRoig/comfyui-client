import {
  type Edge,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlowInstance,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import { IComfyNode } from "./node-types";
import type { DBWorkflow } from "@repo/data-access";
import { updateWorkflowAction } from "./server-actions/update-workflow-action";
import { useMutation } from "@tanstack/react-query";
import { useDebounce } from "../../@lib/use-debounce";

export function useFlowState(initialWorkflow: DBWorkflow) {
  const [nodes, setNodes] = useState<IComfyNode[]>(initialWorkflow.json.nodes);
  const [edges, setEdges] = useState<Edge[]>(initialWorkflow.json.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<IComfyNode>>();

  const persistWorkflowMutation = useMutation({
    mutationFn: async (json: unknown) => {
      return updateWorkflowAction({
        id: initialWorkflow.id,
        json,
      });
    },
    onSuccess: (result) => {
      console.log("saved workflow");
    }
  });

  const debouncedPersistWorkflow = useDebounce(persistWorkflowMutation.mutate, 5000);

  const { getNodes: _getNodes, getEdges: _getEdges, addNodes, addEdges } = useReactFlow();

  const onNodesChange: OnNodesChange<IComfyNode> = useCallback((changes) => {
    setNodes((nds) => {
      const newNodes = applyNodeChanges(changes, nds);
      if (reactFlowInstance) {
          const currentSchema = reactFlowInstance.toObject();
          console.log("ON NODES CHANGE", newNodes);
          debouncedPersistWorkflow({
            edges: currentSchema.edges,
            nodes: newNodes,
          })
        } else {
          console.warn("reactFlowInstance is undefined");
        }
      return newNodes;
    });
  }, [reactFlowInstance]);

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        if (reactFlowInstance) {
          const currentSchema = reactFlowInstance.toObject();
          debouncedPersistWorkflow({
            edges: newEdges,
            nodes: currentSchema.nodes,
          })
        } else {
          console.warn("reactFlowInstance is undefined");
        }
        return newEdges;
      }),
    [reactFlowInstance],
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
  };
}
