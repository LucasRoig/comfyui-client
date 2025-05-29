"use client";
import { Button } from "@lro-ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { CreateProjectModal } from "../../modules/project/create-project-modal";

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <CreateProjectModal isOpen={isOpen} onOpenChange={setIsOpen} />
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="h-5 w-5" />
        Create a project
      </Button>
    </>
  );
}
