import {
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";

export function useFlowState() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const { getNodes: _getNodes, getEdges: _getEdges, addNodes, addEdges } = useReactFlow();

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const newNodes = applyNodeChanges(changes, nds);
      return newNodes;
    });
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        return newEdges;
      }),
    [],
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
  };
}
