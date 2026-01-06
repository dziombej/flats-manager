import { useState, useCallback } from "react";

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface UseFormStateOptions<T> {
  initialData: T;
  validate: (data: T) => FormErrors;
}

export interface UseFormStateReturn<T> {
  formData: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isSuccess: boolean;
  updateField: (field: keyof T, value: any) => void;
  setErrors: (errors: FormErrors) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSuccess: (isSuccess: boolean) => void;
  validate: () => boolean;
  reset: () => void;
}

/**
 * Generic form state management hook
 * Handles form data, validation, errors, and submission state
 */
export function useFormState<T extends Record<string, any>>({
  initialData,
  validate,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData, validate]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setSubmitting(false);
    setSuccess(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    updateField,
    setErrors,
    setSubmitting,
    setSuccess,
    validate: validateForm,
    reset,
  };
}

