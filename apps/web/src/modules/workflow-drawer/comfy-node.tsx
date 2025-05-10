"use client";
import type { ComfyNodeDefinition } from "@repo/comfy-ui-api-client";
import type { NodeProps } from "@xyflow/react";
import { useMemo } from "react";
import { match } from "ts-pattern";
import { BaseNode } from "./base-node";
import type { IComfyNode } from "./node-types";

const getInputColor = (_inputType: string) => {
  return "hsla(0, 0%, 0%, 0.2)";
};

type RecordValue<T> = T extends Record<string | number | symbol, infer TValue> ? TValue : never;
type ComfyInputDefinition = RecordValue<ComfyNodeDefinition["input"]["required"]>;

function requiresSpecificComponent(input: ComfyInputDefinition): boolean {
  return match(input.kind)
    .with("BOOLEAN", () => true)
    .with("STRING", () => true)
    .with("INT", () => true)
    .with("FLOAT", () => true)
    .with("FLOATS", () => true)
    .with("NUMBER_ARRAY", () => true)
    .with("STRING_ARRAY", () => true)
    .with("IMAGE_UPLOAD_COMBO", () => true)
    .with("NUMBER_ARRAY_COMBO", () => true)
    .with("STRING_ARRAY_COMBO", () => true)
    .with("CUSTOM", () => false)
    .with("*", () => false)
    .exhaustive();
}

const sortInputs = (inputOrder: string[]) => (a: ComfyInputDefinition, b: ComfyInputDefinition) => {
  //First the inputs that doesn't require a specific component
  //Because we can put outputs on the same row
  if (requiresSpecificComponent(a) && !requiresSpecificComponent(b)) {
    return 1;
  }
  if (!requiresSpecificComponent(a) && requiresSpecificComponent(b)) {
    return -1;
  }
  const aIndex = inputOrder.indexOf(a.name);
  const bIndex = inputOrder.indexOf(b.name);
  if (aIndex === -1 && bIndex === -1) {
    return a.name.localeCompare(b.name);
  }
  if (aIndex === -1 && bIndex !== -1) {
    return -1;
  }
  if (aIndex !== -1 && bIndex === -1) {
    return 1;
  }
  if (aIndex > bIndex) {
    return 1;
  }
  if (aIndex < bIndex) {
    return -1;
  }
  return 0;
};

export function ComfyNode(props: NodeProps<IComfyNode>) {
  const nodeDefinition = props.data.definition;
  const sortedRequiredInputs = useMemo(() => {
    const sortFn = sortInputs([...nodeDefinition.input_order.required, ...(nodeDefinition.input_order.optional ?? [])]);
    const allInputs = [
      ...Object.values(nodeDefinition.input.required),
      ...(nodeDefinition.input.optional ? Object.values(nodeDefinition.input.optional) : []),
    ].sort(sortFn);
    return allInputs;
  }, [nodeDefinition]);

  return (
    <BaseNode className="flex flex-col p-0" selected={false}>
      <div className="border-b px-5 py-2 font-medium">{nodeDefinition.display_name}</div>
      {sortedRequiredInputs.map((input) => (
        <div key={input.name} className="pl-1 flex items-center gap-2 py-0.5 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(input.kind) }} />
          <div>{input.name}</div>
        </div>
      ))}
    </BaseNode>
  );
}
