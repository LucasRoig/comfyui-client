"use client";
import { Button } from "@lro-ui/button";
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@lro-ui/modal";
import z from "zod";
import { useAppForm } from "../../@components/form/form-hooks";

type CreateProjectModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const formSchema = z.object({
  name: z.string().min(3),
});

export function CreateProjectModal(props: CreateProjectModalProps) {
  const form = useAppForm({
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
            <form.AppField name="name">
              {(field) => <field.TextField label="Name" description="description" />}
            </form.AppField>
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
