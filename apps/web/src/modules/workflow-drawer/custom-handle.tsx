import { Handle } from "@xyflow/react";
import type { ComponentProps, CSSProperties } from "react";

export function CustomHandle(props: Omit<ComponentProps<typeof Handle>, "id"> & { id: string }) {
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
