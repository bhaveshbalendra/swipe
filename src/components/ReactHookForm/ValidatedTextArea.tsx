import { Input } from "antd";
import type { FieldValues } from "react-hook-form";
import {
  BaseValidatedField,
  type BaseValidatedFieldProps,
} from "./BaseValidatedField";

interface ValidatedTextAreaProps<T extends FieldValues>
  extends BaseValidatedFieldProps<T> {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  bordered?: boolean;
}

export const ValidatedTextArea = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  rows = 4,
  showError = true,
  validateOnChange = true,
  validateOnBlur = true,
  disabled,
  maxLength,
  showCount,
  bordered,
  required = false,
}: ValidatedTextAreaProps<T>) => {
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
          <Input.TextArea
            {...renderField(field, fieldState)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            showCount={showCount}
            bordered={bordered}
          />
        )}
      />
      {renderError()}
    </div>
  );
};

export default ValidatedTextArea;
