import { Select } from "antd";
import type { FieldValues } from "react-hook-form";
import {
  BaseValidatedField,
  type BaseValidatedFieldProps,
} from "./BaseValidatedField";

interface ValidatedSelectProps<T extends FieldValues>
  extends BaseValidatedFieldProps<T> {
  options: { label: string; value: string | number }[];
  placeholder?: string;
}

export const ValidatedSelect = <T extends FieldValues>({
  form,
  name,
  label,
  showError = true,
  validateOnChange = true,
  validateOnBlur = true,
  disabled,
  options,
  placeholder,
  required = false,
}: ValidatedSelectProps<T>) => {
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
          <Select
            {...renderField(field, fieldState)}
            options={options}
            placeholder={placeholder}
          />
        )}
      />
      {renderError()}
    </div>
  );
};

export default ValidatedSelect;
