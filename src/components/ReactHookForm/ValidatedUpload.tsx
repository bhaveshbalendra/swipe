import { Upload } from "antd";
import type { FieldValues } from "react-hook-form";
import {
  BaseValidatedField,
  type BaseValidatedFieldProps,
} from "./BaseValidatedField";

interface ValidatedUploadProps<T extends FieldValues>
  extends BaseValidatedFieldProps<T> {
  maxCount?: number;
  accept?: string;
}

export const ValidatedUpload = <T extends FieldValues>({
  form,
  name,
  label,
  showError = true,
  validateOnChange = true,
  disabled,
  maxCount = 1,
  accept,
  required = false,
}: ValidatedUploadProps<T>) => {
  const { Controller, control, renderError, renderLabel } = BaseValidatedField({
    form,
    name,
    label,
    showError,
    validateOnChange,
    disabled,
    required,
  });

  return (
    <div>
      {renderLabel()}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Upload
            maxCount={maxCount}
            accept={accept}
            disabled={disabled}
            fileList={
              field.value
                ? Array.isArray(field.value)
                  ? field.value.map((file: File, index: number) => ({
                      uid: `${index}`,
                      name: file.name,
                      status: "done",
                      url: URL.createObjectURL(file),
                    }))
                  : [
                      {
                        uid: "0",
                        name: (field.value as File).name,
                        status: "done",
                        url: URL.createObjectURL(field.value as File),
                      },
                    ]
                : []
            }
            onChange={(info) => {
              let newValue: File | File[] | null = null;

              if (info.fileList && info.fileList.length > 0) {
                const files = info.fileList
                  .filter((file) => file.originFileObj)
                  .map((file) => file.originFileObj as File);

                if (maxCount === 1) {
                  newValue = files[0] || null;
                } else {
                  newValue = files;
                }
              }

              field.onChange(newValue);

              if (validateOnChange && newValue !== null) {
                form.trigger(name);
              }
            }}
            onRemove={() => {
              field.onChange(null);
              form.trigger(name);
            }}
          />
        )}
      />
      {renderError()}
    </div>
  );
};

export default ValidatedUpload;
