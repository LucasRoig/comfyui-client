import type {
  WebSocketExecutedMessage,
  WebSocketExecutingMessage,
  WebSocketProgressMessage,
} from "@repo/comfy-ui-api-client";
import { match } from "ts-pattern";

export type ExecutionState =
  | {
      kind: "idle";
    }
  | {
      kind: "running";
      promptId: string;
      nodeId: string | undefined;
      displayNodeId: string | undefined;
      progress:
        | {
            value: number;
            max: number;
          }
        | undefined;
    };

export function newExecutionState(): ExecutionState {
  return {
    kind: "idle",
  };
}

export function onExecutingMessage(_currentState: ExecutionState, message: WebSocketExecutingMessage): ExecutionState {
  //start node execution
  return {
    kind: "running",
    promptId: message.data.prompt_id,
    nodeId: message.data.node,
    displayNodeId: message.data.display_node,
    progress: undefined,
  };
}

export function onProgressMessage(currentState: ExecutionState, message: WebSocketProgressMessage): ExecutionState {
  //update node progress
  return match(currentState)
    .with({ kind: "running" }, (c) => ({
      ...c,
      nodeId: message.data.node ?? c.nodeId,
      progress: {
        value: message.data.value,
        max: message.data.max,
      },
    }))
    .with({ kind: "idle" }, () => ({
      kind: "running" as const,
      promptId: message.data.prompt_id,
      nodeId: message.data.node ?? undefined,
      displayNodeId: message.data.node ?? undefined,
      progress: {
        value: message.data.value,
        max: message.data.max,
      },
    }))
    .exhaustive();
}

export function onExecutedMessage(_currentState: ExecutionState, _message: WebSocketExecutedMessage): ExecutionState {
  //end prompt execution
  return {
    kind: "idle",
  };
}
