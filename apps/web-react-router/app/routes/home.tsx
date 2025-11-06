import { Button } from "@lro-ui/button";
import { call } from "@orpc/server";
import { EllipsisVerticalIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { appRouter } from "~/.server";
import { CreateProjectModal } from "~/modules/projects/create-project-modal";
import { Routes } from "~/routes";
import type { Route } from "./+types/home";

export async function loader() {
  const projects = await call(appRouter.projects.list, {});

  return { projects };
}

export function meta() {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export default function Home(props: Route.ComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="max-w-2xl min-w-2xl mx-auto">
      <div className="mb-4 flex items-baseline">
        <h1 className="font-bold">Projects</h1>
        <Button className="ml-auto" onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="text-white" />
          New Project
        </Button>
        <CreateProjectModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
      <div className="flex flex-col border bg-white rounded-md overflow-auto">
        {props.loaderData.projects.map((p) => (
          <Link
            to={Routes.project.view(p.id)}
            className="px-4 py-2 cursor-pointer not-last:border-b flex items-center"
            key={p.id}
          >
            <p>{p.name}</p>
            <Button
              className="ml-auto"
              variant="text"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <EllipsisVerticalIcon />
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
