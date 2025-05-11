"use client";
import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList } from "@lro-ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@lro-ui/popover";
import type { ComfyNodeDefinition } from "@repo/comfy-ui-api-client";
import { type NodeProps, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { useMemo, useState } from "react";
import { P, match } from "ts-pattern";
import { BaseNode } from "./base-node";
import type { IComfyNode, InputState } from "./node-types";

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

function CommandPicker(props: {
  name: string;
  options: string[] | number[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect: (option: string | number) => void;
}) {
  return (
    <CommandDialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <CommandInput placeholder={`${props.name}...`} />
      <CommandList>
        <CommandEmpty>No match found.</CommandEmpty>
        {props.options.map((option) => (
          <CommandItem
            key={option}
            onSelect={() => {
              props.onSelect(option);
              props.setIsOpen(false);
            }}
          >
            {option}
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

function PopoverInput(props: { defaultValue: string; trigger: React.ReactNode; onClose: (value: string) => void }) {
  const [value, setValue] = useState(props.defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (!isOpen) {
      props.onClose(value);
    }
  };
  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{props.trigger}</PopoverTrigger>
      <PopoverContent>
        <input value={value} onChange={(e) => setValue(e.target.value)} />
      </PopoverContent>
    </Popover>
  );
}

function Input(props: { input: ComfyInputDefinition; state: InputState; onStateChange: (state: InputState) => void }) {
  const component = match(props.input)
    .with({ kind: "STRING_ARRAY" }, (i) => {
      if (props.state.kind !== "STRING_ARRAY") {
        throw new Error("Expected STRING_ARRAY state");
      }
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
          <CommandPicker
            name={i.name}
            options={i.options}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onSelect={(option) => {
              props.onStateChange({
                ...props.state,
                value: option.toString(),
              } as InputState);
              setIsOpen(false);
            }}
          />
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div className="text-muted-foreground hover:text-foreground cursor-default" onClick={() => setIsOpen(true)}>
            {props.input.name} : {props.state.value}
          </div>
        </div>
      );
    })
    .with({ kind: "INT" }, (i) => {
      const [isControlAfterGenerateOpen, setIsControlAfterGenerateOpen] = useState(false);
      if (props.state.kind !== "INT") {
        throw new Error("Expected INT state");
      }
      const updateValue = (value: string) => {
        let parsedValue = Number.parseInt(value);
        if (Number.isNaN(parsedValue)) {
          return;
        }
        if (!Number.isFinite(parsedValue)) {
          return;
        }
        if (i.config.min !== undefined && i.config.min !== null && i.config.min && parsedValue < i.config.min) {
          parsedValue = i.config.min;
        }
        if (i.config.min !== undefined && i.config.min !== null && i.config.max && parsedValue > i.config.max) {
          parsedValue = i.config.max;
        }
        props.onStateChange({
          ...props.state,
          value: parsedValue.toString(),
        } as InputState);
      };

      return (
        <>
          <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
            <PopoverInput
              defaultValue={props.state.value}
              trigger={
                <div className="text-muted-foreground hover:text-foreground cursor-default">
                  {props.input.name} : {Number.parseInt(props.state.value)}
                </div>
              }
              onClose={(v) => updateValue(v)}
            />
          </div>
          {i.config.control_after_generate ? (
            <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
              <CommandPicker
                name={`${i.name}_control_after_generate`}
                options={["fixed", "increment", "decrement", "randomize"]}
                isOpen={isControlAfterGenerateOpen}
                setIsOpen={setIsControlAfterGenerateOpen}
                onSelect={(option) => {
                  props.onStateChange({
                    ...props.state,
                    controlAfterGenerate: option,
                  } as InputState);
                  setIsControlAfterGenerateOpen(false);
                }}
              />
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
              <div
                className="text-muted-foreground hover:text-foreground cursor-default"
                onClick={() => setIsControlAfterGenerateOpen(true)}
              >
                control_after_generate : {props.state.controlAfterGenerate}
              </div>
            </div>
          ) : null}
        </>
      );
    })
    .with({ kind: "FLOAT" }, (i) => {
      if (props.state.kind !== "FLOAT") {
        throw new Error("Expected FLOAT state");
      }
      const displayPrecision = match(i.config.round)
        .with(P.number, (i) => i.toString().replace(".", "").length - 1)
        .with(P.boolean, () => 3)
        .with(null, undefined, () =>
          match(i.config.step)
            .with(P.number, (i) => i.toString().replace(".", "").length - 1)
            .with(null, undefined, () => 3)
            .exhaustive(),
        )
        .exhaustive();
      const roundPrecision = match(i.config.round)
        .with(P.number, (i) => i.toString().replace(".", "").length - 1)
        .with(true, () => 3)
        .otherwise(() => undefined);

      const updateValue = (value: string) => {
        let parsedValue = Number.parseFloat(value.replace(",", "."));
        if (Number.isNaN(parsedValue)) {
          return;
        }
        if (!Number.isFinite(parsedValue)) {
          return;
        }
        if (i.config.min !== undefined && i.config.min !== null && parsedValue < i.config.min) {
          parsedValue = i.config.min;
        }
        if (i.config.max !== undefined && i.config.max !== null && i.config.max && parsedValue > i.config.max) {
          parsedValue = i.config.max;
        }
        if (roundPrecision !== undefined) {
          parsedValue = Number.parseFloat(parsedValue.toFixed(roundPrecision));
        }
        props.onStateChange({
          ...props.state,
          value: parsedValue.toString(),
        } as InputState);
      };

      return (
        <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
          <PopoverInput
            defaultValue={props.state.value}
            trigger={
              <div className="text-muted-foreground hover:text-foreground cursor-default">
                {props.input.name} : {Number.parseFloat(props.state.value).toFixed(displayPrecision)}
              </div>
            }
            onClose={(v) => updateValue(v)}
          />
        </div>
      );
    })
    .with({ kind: "CUSTOM" }, () => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
        <div>{props.input.name}</div>
      </div>
    ))
    .with({ kind: "BOOLEAN" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
        <div>Unhandled kind : {i.kind}</div>
      </div>
    ))
    .with({ kind: "*" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
        <div>Unhandled kind : {i.kind}</div>
      </div>
    ))
    .with({ kind: "FLOATS" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
        <div>Unhandled kind : {i.kind}</div>
      </div>
    ))
    .with({ kind: "IMAGE_UPLOAD_COMBO" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
        <div>Unhandled kind : {i.kind}</div>
      </div>
    ))
    .with({ kind: "NUMBER_ARRAY" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
        <div>Unhandled kind : {i.kind}</div>
      </div>
    ))
    .with({ kind: "NUMBER_ARRAY_COMBO" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
        <div>Unhandled kind : {i.kind}</div>
      </div>
    ))
    .with({ kind: "STRING" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
        <div>Unhandled kind : {i.kind}</div>
      </div>
    ))
    .with({ kind: "STRING_ARRAY_COMBO" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(props.input.kind) }} />
        <div>Unhandled kind : {i.kind}</div>
      </div>
    ))
    .exhaustive();
  return component;
}

export function ComfyNode(props: NodeProps<IComfyNode>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const { updateNodeData } = useReactFlow();

  const nodeDefinition = props.data.definition;
  const nodeState = props.data.state;
  const sortedRequiredInputs = useMemo(() => {
    const sortFn = sortInputs([...nodeDefinition.input_order.required, ...(nodeDefinition.input_order.optional ?? [])]);
    const allInputs = [
      ...Object.values(nodeDefinition.input.required),
      ...(nodeDefinition.input.optional ? Object.values(nodeDefinition.input.optional) : []),
    ].sort(sortFn);
    return allInputs;
  }, [nodeDefinition]);

  const updateInputState = (inputName: string, inputState: InputState) => {
    updateNodeData(props.id, {
      state: {
        ...props.data.state,
        inputs: {
          ...props.data.state.inputs,
          [inputName]: inputState,
        },
      },
    });
    updateNodeInternals(props.id);
  };

  return (
    <BaseNode className="flex flex-col p-0" selected={false}>
      <div className="border-b px-5 py-2 font-medium">{nodeDefinition.display_name}</div>
      {sortedRequiredInputs.map((input) => (
        <Input
          key={input.name}
          input={input}
          state={nodeState.inputs[input.name]!}
          onStateChange={(state) => updateInputState(input.name, state)}
        />
      ))}
    </BaseNode>
  );
}
