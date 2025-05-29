"use client";
import { Button } from "@lro-ui/button";
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@lro-ui/modal";
import { type AnyFieldApi, useForm } from "@tanstack/react-form";

type CreateProjectModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.map((err) => err.message).join(",")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export function CreateProjectModal(props: CreateProjectModalProps) {
  const form = useForm({
    defaultValues: {
      name: "",
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
                return (
                  <>
                    <label htmlFor={field.name}>First Name:</label>
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldInfo field={field} />
                  </>
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
