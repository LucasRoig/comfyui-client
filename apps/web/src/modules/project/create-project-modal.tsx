"use client";
import { Button } from "@lro-ui/button";
import { Input, Label } from "@lro-ui/input";
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@lro-ui/modal";
import { cn } from "@lro-ui/utils";
import { Slot } from "@radix-ui/react-slot";
import { useForm } from "@tanstack/react-form";
import z from "zod";

type CreateProjectModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const formSchema = z.object({
  name: z.string().min(3),
});

export function CreateProjectModal(props: CreateProjectModalProps) {
  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (event) => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log(event.value);
    },
  });
  return (
    <Modal open={props.isOpen} onOpenChange={props.onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Create a new project</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <form
            id="create-project-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(e);
            }}
          >
            <form.Field name="name">
              {(field) => {
                const isError = field.state.meta.isTouched && field.state.meta.isValid === false;
                const errorBody = field.state.meta.errors
                  .map((err) => err?.message)
                  .filter((e) => e !== undefined)
                  .join(", ");
                return (
                  <div className={cn("space-y-2")}>
                    <div>
                      <Label htmlFor={field.name} className={cn(isError && "text-destructive")}>
                        Name:
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
                    <p className={cn("text-sm text-muted-foreground")}>description</p>
                    {isError ? <p className={cn("text-sm font-medium text-destructive")}>{errorBody}</p> : null}
                  </div>
                );
              }}
            </form.Field>
          </form>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="text">Cancel</Button>
          </ModalClose>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => {
              return (
                <Button type="submit" form="create-project-form" disabled={isSubmitting}>
                  Create Project
                </Button>
              );
            }}
          </form.Subscribe>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
