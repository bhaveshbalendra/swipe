import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { ZodType } from "zod";

interface UseFormValidationOptions<T extends FieldValues> {
  schema: ZodType<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onError?: (errors: unknown) => void;
}

export const useFormValidation = <T extends FieldValues>({
  schema,
  onSubmit,
  onError,
}: UseFormValidationOptions<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(schema as never) as never,
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit(
    async (data: T) => {
      try {
        await onSubmit(data);
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    },
    (errors) => {
      if (onError) {
        onError(errors);
      }
    }
  );

  return {
    ...form,
    handleSubmit,
  };
};
