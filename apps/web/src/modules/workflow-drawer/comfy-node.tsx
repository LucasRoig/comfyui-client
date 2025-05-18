"use client";
import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList } from "@lro-ui/command";
import { Checkbox, Textarea } from "@lro-ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@lro-ui/popover";
import { Progress } from "@lro-ui/progress";
import { cn } from "@lro-ui/utils";
import type { ComfyNodeDefinition } from "@repo/comfy-ui-api-client";
import { type NodeProps, Position, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { useId, useMemo, useState } from "react";
import { P, match } from "ts-pattern";
import { useExecutionState } from "../comfy-ui/comfy-ui-context";
import { BaseNode } from "./base-node";
import { CustomHandle } from "./custom-handle";
import type { IComfyNode, InputState } from "./node-types";

// const getInputColor = (_inputType: string) => {
//   return "hsla(0, 0%, 0%, 0.2)";
// };

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

function Input(props: {
  id: string;
  input: ComfyInputDefinition;
  state: InputState;
  onStateChange: (state: InputState) => void;
}) {
  const component = match(props.input)
    .with({ kind: "STRING_ARRAY" }, (i) => {
      if (props.state.kind !== "STRING_ARRAY") {
        throw new Error("Expected STRING_ARRAY state");
      }
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
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
          <CustomHandle type="target" position={Position.Left} id={props.id} />
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
        if (i.config?.min !== undefined && i.config.min !== null && i.config.min && parsedValue < i.config.min) {
          parsedValue = i.config.min;
        }
        if (i.config?.min !== undefined && i.config.min !== null && i.config.max && parsedValue > i.config.max) {
          parsedValue = i.config.max;
        }
        props.onStateChange({
          ...props.state,
          value: parsedValue.toString(),
        } as InputState);
      };

      return (
        <>
          <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
            <CustomHandle type="target" position={Position.Left} id={props.id} />
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
          {i.config?.control_after_generate ? (
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
        <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
          <CustomHandle type="target" position={Position.Left} id={props.id} />
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
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
        <CustomHandle type="target" position={Position.Left} id={props.id} />
        <div>{props.input.name}</div>
      </div>
    ))
    .with({ kind: "BOOLEAN" }, (_i) => {
      const checkboxId = useId();
      if (props.state.kind !== "BOOLEAN") {
        throw new Error("Expected BOOLEAN state");
      }
      return (
        <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
          <CustomHandle type="target" position={Position.Left} id={props.id} />
          <div className="flex items-center gap-2">
            <label htmlFor={checkboxId}>{props.input.name}</label>
            <Checkbox
              id={checkboxId}
              value={props.state.value}
              onCheckedChange={(value) => props.onStateChange({ ...props.state, value: String(value) } as InputState)}
            />
          </div>
        </div>
      );
    })
    .with({ kind: "*" }, (_i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
        <CustomHandle type="target" position={Position.Left} id={props.id} />
        <div>{props.input.name}</div>
      </div>
    ))
    .with({ kind: "FLOATS" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
        <CustomHandle type="target" position={Position.Left} id={props.id} />
        <div>Beta Node Unhandled kind : {i.kind}</div>
      </div>
    ))
    .with({ kind: "IMAGE_UPLOAD_COMBO" }, (i) => (
      <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
        <CustomHandle type="target" position={Position.Left} id={props.id} />
        <div>Beta Node Unhandled kind : {i.kind}</div>
      </div>
    ))
    .with({ kind: "NUMBER_ARRAY" }, (i) => {
      if (props.state.kind !== "NUMBER_ARRAY") {
        throw new Error("Expected NUMBER_ARRAY state");
      }
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
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
          <CustomHandle type="target" position={Position.Left} id={props.id} />
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div className="text-muted-foreground hover:text-foreground cursor-default" onClick={() => setIsOpen(true)}>
            {props.input.name} : {props.state.value}
          </div>
        </div>
      );
    })
    .with({ kind: "NUMBER_ARRAY_COMBO" }, (i) => {
      if (props.state.kind !== "NUMBER_ARRAY_COMBO") {
        throw new Error("Expected NUMBER_ARRAY_COMBO state");
      }
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
          <CommandPicker
            name={i.name}
            options={i.config.options}
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
          <CustomHandle type="target" position={Position.Left} id={props.id} />
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div className="text-muted-foreground hover:text-foreground cursor-default" onClick={() => setIsOpen(true)}>
            {props.input.name} : {props.state.value}
          </div>
        </div>
      );
    })
    .with({ kind: "STRING" }, (i) => {
      if (props.state.kind !== "STRING") {
        throw new Error("Expected STRING state");
      }
      const updateValue = (value: string) => {
        props.onStateChange({
          ...props.state,
          value: value,
        } as InputState);
      };
      if (i.config?.multiline) {
        return (
          <>
            <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
              <CustomHandle type="target" position={Position.Left} id={props.id} />
              <div className="text-muted-foreground hover:text-foreground cursor-default">{props.input.name} :</div>
            </div>
            <div className="px-1 pb-1">
              <Textarea
                className="resize-none"
                value={props.state.value}
                onChange={(e) => updateValue(e.target.value)}
              />
            </div>
          </>
        );
      } else {
        return (
          <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
            <CustomHandle type="target" position={Position.Left} id={props.id} />
            <PopoverInput
              defaultValue={props.state.value}
              trigger={
                <div className="text-muted-foreground hover:text-foreground cursor-default">
                  {props.input.name} : {props.state.value}
                </div>
              }
              onClose={(v) => updateValue(v)}
            />
          </div>
        );
      }
    })
    .with({ kind: "STRING_ARRAY_COMBO" }, (i) => {
      if (props.state.kind !== "STRING_ARRAY_COMBO") {
        throw new Error("Expected STRING_ARRAY_COMBO state");
      }
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div className="pl-1 pr-1 flex items-center gap-2 py-0.5 text-xs relative">
          <CommandPicker
            name={i.name}
            options={i.config.options}
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
          <CustomHandle type="target" position={Position.Left} id={props.id} />
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div className="text-muted-foreground hover:text-foreground cursor-default" onClick={() => setIsOpen(true)}>
            {props.input.name} : {props.state.value}
          </div>
        </div>
      );
    })
    .exhaustive();
  return component;
}

export function ComfyNode(props: NodeProps<IComfyNode>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const { updateNodeData } = useReactFlow<IComfyNode>();
  const executionState = useExecutionState();
  const isRunning = match(executionState)
    .with({ kind: "running" }, (s) => s.nodeId === props.id)
    .otherwise(() => false);
  const progressValue = match(executionState)
    .with({ kind: "running" }, (s) => (isRunning && s.progress ? (s.progress.value / s.progress.max) * 100 : 0))
    .otherwise(() => 0);

  const nodeDefinition = props.data.definition;
  const executionOutput = props.data.executionOutput;
  const nodeState = props.data.state;
  const sortedRequiredInputs = useMemo(() => {
    const sortFn = sortInputs([
      ...(nodeDefinition.input_order.required ?? []),
      ...(nodeDefinition.input_order.optional ?? []),
    ]);
    const allInputs = [
      ...(nodeDefinition.input.required ? Object.values(nodeDefinition.input.required) : []),
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
    <BaseNode className={cn("flex flex-col p-0", isRunning && "border-green-400")} selected={false}>
      <div className="border-b px-5 py-2 font-medium">{nodeDefinition.display_name}</div>
      <Progress value={progressValue} className="rounded-none h-0.5 bg-transparent" indicatorClassName="bg-green-400" />
      {nodeDefinition.output.map((outputName, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={i} className="pl-1 pr-1 flex justify-end items-center gap-2 py-0.5 text-xs relative">
          {outputName}
          <CustomHandle type="source" position={Position.Right} id={`output_${i}`} />
          {/* <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getInputColor(outputName) }} /> */}
        </div>
      ))}
      {sortedRequiredInputs.map((input, _i) => (
        <Input
          id={`input_${input.name}`}
          key={input.name}
          input={input}
          state={nodeState.inputs[input.name]!}
          onStateChange={(state) => updateInputState(input.name, state)}
        />
      ))}
      {executionOutput ? (
        <div>
          <img src={`http://localhost:8000/view?filename=${executionOutput.images?.[0]?.comfy.filename}`} alt="" />
        </div>
      ) : null}
    </BaseNode>
  );
}
