import { Form } from "antd";
import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { ZodSchema } from "zod";
import { useFormValidation } from "../../hooks/useFormValidation";

interface ValidatedFormProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  children: (form: UseFormReturn<T>) => ReactNode;
  onError?: (errors: unknown) => void;
  showValidationErrors?: boolean;
  layout?: "horizontal" | "vertical" | "inline";
}

export const ValidatedForm = <T extends FieldValues>({
  schema,
  onSubmit,
  children,
  onError,
  showValidationErrors = true,
  layout = "vertical",
}: ValidatedFormProps<T>) => {
  const form = useFormValidation({
    schema,
    onSubmit,
    onError,
  });

  const { handleSubmit, formState } = form;

  return (
    <Form layout={layout} onFinish={handleSubmit as never}>
      {children(form as unknown as UseFormReturn<T>)}

      {showValidationErrors && Object.keys(formState.errors).length > 0 && (
        <div style={{ marginTop: 16 }}>
          {Object.entries(formState.errors).map(([field, error]) => (
            <div key={field} style={{ color: "#ff4d4f", marginBottom: 8 }}>
              <strong>{field}:</strong>{" "}
              {String((error as { message?: string })?.message || "")}
            </div>
          ))}
        </div>
      )}
    </Form>
  );
};

export default ValidatedForm;
