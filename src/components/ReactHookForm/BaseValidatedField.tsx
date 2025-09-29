import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

export interface BaseValidatedFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  showError?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const BaseValidatedField = <T extends FieldValues>({
  form,
  name,
  label,
  showError = true,
  validateOnChange = true,
  validateOnBlur = true,
  disabled,
  required = false,
}: BaseValidatedFieldProps<T>) => {
  const { control, formState } = form;
  const { errors, isSubmitting } = formState;

  const getFieldError = () => {
    return (errors as Record<string, { message?: string }>)[name]?.message;
  };

  const hasFieldError = () => {
    return !!(errors as Record<string, unknown>)[name];
  };

  const renderField = (
    field: { onChange: (value: unknown) => void; onBlur: () => void },
    fieldState: { error?: { message?: string } }
  ) => {
    return {
      ...field,
      status: fieldState.error ? ("error" as const) : undefined,
      disabled: disabled || isSubmitting,
      onChange: (value: unknown) => {
        field.onChange(value);
        if (validateOnChange) {
          form.trigger(name);
        }
      },
      onBlur: () => {
        field.onBlur();
        if (validateOnBlur) {
          form.trigger(name);
        }
      },
    };
  };

  const renderError = () => {
    if (!showError || !hasFieldError()) return null;

    return (
      <div style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px" }}>
        {getFieldError()}
      </div>
    );
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <label style={{ display: "block", marginBottom: 8 }}>
        {label}
        {required && <span style={{ color: "#ff4d4f", marginLeft: 4 }}>*</span>}
      </label>
    );
  };

  return {
    Controller,
    control,
    name,
    renderField,
    renderError,
    renderLabel,
    getFieldError,
    hasFieldError,
  };
};
