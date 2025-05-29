import { Input, Label } from "@lro-ui/input";
import { cn } from "@lro-ui/utils";
import { Slot } from "@radix-ui/react-slot";
import { useFieldContext } from "./form-hooks";

type TextFieldProps = {
  label: string;
  description?: string;
};

export function TextField(props: TextFieldProps) {
  const field = useFieldContext<string>();
  const isError = field.state.meta.isTouched && field.state.meta.isValid === false;
  const errorBody = field.state.meta.errors
    .map((err) => err?.message)
    .filter((e) => e !== undefined)
    .join(", ");

  return (
    <div className={cn("space-y-2")}>
      <div>
        <Label htmlFor={field.name} className={cn(isError && "text-destructive")}>
          {props.label}
        </Label>
      </div>
      <Slot id={field.name} aria-invalid={isError}>
        <Input
          type="text"
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </Slot>
      {props.description ? <p className={cn("text-sm text-muted-foreground")}>{props.description}</p> : null}
      {isError ? <p className={cn("text-sm font-medium text-destructive")}>{errorBody}</p> : null}
    </div>
  );
}
