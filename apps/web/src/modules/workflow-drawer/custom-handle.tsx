import { Handle } from "@xyflow/react";
import type { CSSProperties, ComponentProps } from "react";

export function CustomHandle(props: ComponentProps<typeof Handle>) {
  let style: CSSProperties = {
    position: "relative",
    transform: "none",
    border: "none",
    height: "0.5rem",
    width: "0.5rem",
    backgroundColor: "hsla(0, 0%, 0%, 0.2)",
  };
  style = {
    ...style,
    ...props.style,
  };

  return <Handle {...props} style={style} />;
}
