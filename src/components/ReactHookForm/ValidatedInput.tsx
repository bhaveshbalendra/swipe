import { Input } from "antd";
import type { FieldValues } from "react-hook-form";
import {
  BaseValidatedField,
  type BaseValidatedFieldProps,
} from "./BaseValidatedField";

interface ValidatedInputProps<T extends FieldValues>
  extends BaseValidatedFieldProps<T> {
  placeholder?: string;
  type?: string;
}

export const ValidatedInput = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type,
  showError = true,
  validateOnChange = true,
  validateOnBlur = true,
  disabled,
  required = false,
}: ValidatedInputProps<T>) => {
  const { Controller, control, renderField, renderError, renderLabel } =
    BaseValidatedField({
      form,
      name,
      label,
      showError,
      validateOnChange,
      validateOnBlur,
      disabled,
      required,
    });

  return (
    <div>
      {renderLabel()}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...renderField(field, fieldState)}
            placeholder={placeholder}
            type={type}
          />
        )}
      />
      {renderError()}
    </div>
  );
};

export default ValidatedInput;
