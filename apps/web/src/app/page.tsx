import { Button } from "@lro-ui/button";
import { FolderOpen } from "lucide-react";
import { CreateProjectButton } from "./_components/create-project-button";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col w-[192px] ">
        <CreateProjectButton />
        <OrDivider />
        <Button>
          <FolderOpen className="h-5 w-5" />
          Open a project
        </Button>
      </div>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="relative my-4 flex items-center justify-center gap-2">
      <span className="border-b grow" />
      OR
      <span className="border-b grow" />
    </div>
  );
}
