import type { FieldValues, UseFormReturn } from "react-hook-form";
import { logger } from "./logger";

// Common form validation utilities
export class FormValidationUtils {
  static validateField<T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldName: keyof T,
    value: unknown
  ): boolean {
    try {
      form.setValue(fieldName as never, value as never, {
        shouldValidate: true,
      });
      return !form.formState.errors[fieldName as keyof T];
    } catch (error) {
      logger.error(
        `Field validation failed for ${String(fieldName)}`,
        "form-validation",
        {
          fieldName,
          value,
          error,
        }
      );
      return false;
    }
  }

  static getFieldError<T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldName: keyof T
  ): string | undefined {
    return (form.formState.errors as Record<string, { message?: string }>)[
      fieldName as string
    ]?.message;
  }

  static hasFieldError<T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldName: keyof T
  ): boolean {
    return !!(form.formState.errors as Record<string, unknown>)[
      fieldName as string
    ];
  }

  static isFieldTouched<T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldName: keyof T
  ): boolean {
    return !!(form.formState.touchedFields as Record<string, unknown>)[
      fieldName as string
    ];
  }

  static isFieldDirty<T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldName: keyof T
  ): boolean {
    return !!(form.formState.dirtyFields as Record<string, unknown>)[
      fieldName as string
    ];
  }

  static validateForm<T extends FieldValues>(
    form: UseFormReturn<T>
  ): Promise<boolean> {
    return new Promise((resolve) => {
      form.trigger().then((isValid) => {
        if (!isValid) {
          const errors = form.formState.errors;
          logger.warn("Form validation failed", "form-validation", { errors });
        }
        resolve(isValid);
      });
    });
  }

  static resetForm<T extends FieldValues>(
    form: UseFormReturn<T>,
    defaultValues?: T
  ): void {
    form.reset(defaultValues);
    logger.info("Form reset", "form-validation", { defaultValues });
  }

  static getFormState<T extends FieldValues>(form: UseFormReturn<T>) {
    return {
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
      isSubmitted: form.formState.isSubmitted,
      errorCount: Object.keys(form.formState.errors).length,
      touchedFields: Object.keys(form.formState.touchedFields),
      dirtyFields: Object.keys(form.formState.dirtyFields),
    };
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  name: /^[a-zA-Z\s]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  url: /^https?:\/\/.+/,
};

// Common validation messages
export const ValidationMessages = {
  required: (field: string) => `${field} is required`,
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  minLength: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) =>
    `${field} must be less than ${max} characters`,
  pattern: (field: string) => `Please enter a valid ${field}`,
  fileSize: (maxSize: number) => `File size must be less than ${maxSize}MB`,
  fileType: (types: string[]) => `Only ${types.join(", ")} files are allowed`,
};
