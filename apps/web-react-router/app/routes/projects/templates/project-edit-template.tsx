import { Input } from "@lro-ui/input";
import GridLayout from "react-grid-layout";
import type { Route } from "./+types/project-edit-template";

export function loader(args: Route.LoaderArgs) {
  return {};
}

export default function ProjectEditTemplatePage() {
  const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 },
  ];
  return (
    <GridLayout className="layout" layout={layout} cols={12} rowHeight={40} width={1200}>
      <div key="a" className="border p-2">
        a
      </div>
      <div key="b" className="border border-muted p-2 flex flex-col">
        <p>blilbu</p>
        <Input className="grow" />
      </div>
      <div key="c" className="border">
        c
      </div>
    </GridLayout>
  );
}
