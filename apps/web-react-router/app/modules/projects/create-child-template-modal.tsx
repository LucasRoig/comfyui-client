import { Button } from "@lro-ui/button";
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@lro-ui/modal";
import { toast } from "@lro-ui/sonner";
import z from "zod";
import { useAppForm } from "../../@components/form/form-hooks";
import { useCreateChildTemplateMutation } from "./use-create-child-template-mutation";

type CreateTemplateModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  parentId: string;
  projectId: string;
};

const formSchema = z.object({
  name: z.string().min(3),
});

export function CreateChildTemplateModal(props: CreateTemplateModalProps) {
  const createTemplateMutation = useCreateChildTemplateMutation();

  const form = useAppForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (event) => {
      createTemplateMutation.mutate({
        name: event.value.name,
        parentId: props.parentId,
        projectId: props.projectId
      }, {
        onSuccess: (response) => {
          props.onOpenChange(false);
          toast.success("Template created")
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    },
  });
  return (
    <Modal open={props.isOpen} onOpenChange={props.onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Create a new template</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <form
            id="create-template-form"
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
                <Button type="submit" form="create-template-form" disabled={isSubmitting}>
                  Create Template
                </Button>
              );
            }}
          </form.Subscribe>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
