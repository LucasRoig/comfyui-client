import type { ComfyNodeDefinition } from "@repo/comfy-ui-api-client";
import type { Node } from "@xyflow/react";

export type InputState =
  | {
      kind: "STRING_ARRAY";
      value: string;
    }
  | {
      kind: "NUMBER_ARRAY";
      value: string;
    }
  | {
      kind: "IMAGE_UPLOAD_COMBO";
      value: string;
    }
  | {
      kind: "STRING";
      value: string;
    }
  | {
      kind: "INT";
      value: string;
    }
  | {
      kind: "FLOAT";
      value: string;
    }
  | {
      kind: "FLOATS";
      value: string;
    }
  | {
      kind: "*";
      value: string;
    }
  | {
      kind: "BOOLEAN";
      value: "true" | "false";
    }
  | {
      kind: "CUSTOM";
      value: string;
    }
  | {
      kind: "NUMBER_ARRAY_COMBO";
      value: string;
    }
  | {
      kind: "STRING_ARRAY_COMBO";
      value: string;
    };

export type IComfyNode = Node<{
  definition: ComfyNodeDefinition;
  state: {
    inputs: Record<string, InputState>;
  };
}>;
