import { match, P } from "ts-pattern";

/*
* Map the validation errors from NextSafeAction to the format expected by the form library
* see https://github.com/TanStack/form/discussions/623
* Use it to set the errorMap of the form like in the onSubmit e.g:
*
  const createProjectMutation = useMutation({
    mutationFn: createProjectAction, //Mutation using NextSafeAction
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
              }
            })
          }
        }
      });
    },
  });
*
*/
export function mapNextSafeActionErrors(validationErrors: {
  [key: string]:
    | {
        _errors?: string[];
      }
    | string[]
    | undefined;
}) {
  const fieldsErrors = Object.fromEntries(
    Object.entries(validationErrors)
      .filter(([key, value]) => key !== "_errors" && value !== undefined)
      .map(([key, value]) => [
        key,
        match(value)
          .with(P.array(P.string), (e) => e.map((e) => ({ message: e })))
          .with({ _errors: P.array(P.string) }, (e) => e._errors.map((e) => ({ message: e })))
          .with(undefined, () => [])
          .exhaustive(),
      ]),
  );
  return fieldsErrors;
}
