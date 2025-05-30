"use client";
import { Button } from "@lro-ui/button";
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@lro-ui/modal";
import { useMutation } from "@tanstack/react-query";
import z from "zod/v4";
import { useAppForm } from "../../@components/form/form-hooks";
import { mapNextSafeActionErrors } from "../../@components/form/form-utils";
import { createProjectAction } from "./server-actions/create-project-action";

type CreateProjectModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const formSchema = z.object({
  name: z.string().min(3),
});

export function CreateProjectModal(props: CreateProjectModalProps) {
  const createProjectMutation = useMutation({
    mutationFn: createProjectAction,
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (event) => {
      createProjectMutation.mutate(event.value, {
        onSuccess: (data) => {
          if (data?.validationErrors) {
            const fieldsErrors = mapNextSafeActionErrors(data.validationErrors);
            form.setErrorMap({
              onSubmit: {
                form: "global error",
                fields: fieldsErrors,
              },
            });
          }
        },
      });
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
