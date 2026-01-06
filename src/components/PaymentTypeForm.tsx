import { useCallback, useId, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useFormState } from "./hooks/useFormState";
import { useNavigation } from "./hooks/useNavigation";
import type { CreatePaymentTypeCommand, UpdatePaymentTypeCommand, PaymentTypeDto, ValidationErrorResponseDto } from "../types";

interface PaymentTypeFormProps {
  mode: 'create' | 'edit';
  flatId: string;
  paymentTypeId?: string;
  initialData?: {
    name: string;
    base_amount: number;
  };
}

interface PaymentTypeFormData {
  name: string;
  baseAmount: string;
}

// Helper: Validate form
const validatePaymentTypeForm = (data: PaymentTypeFormData): { name?: string; base_amount?: string } => {
  const errors: { name?: string; base_amount?: string } = {};

  // Name validation
  const trimmedName = data.name.trim();
  if (trimmedName.length === 0) {
    errors.name = "Name is required";
  } else if (data.name.length > 100) {
    errors.name = "Name must be at most 100 characters";
  }

  // Base amount validation
  const trimmedAmount = data.baseAmount.trim();
  if (trimmedAmount.length === 0) {
    errors.base_amount = "Base amount is required";
  } else {
    const amount = parseFloat(trimmedAmount);
    if (isNaN(amount)) {
      errors.base_amount = "Base amount must be a valid number";
    } else if (amount < 0) {
      errors.base_amount = "Base amount must be non-negative";
    } else if (amount >= 1000000) {
      errors.base_amount = "Base amount must be less than 1,000,000";
    }
  }

  return errors;
};

export default function PaymentTypeForm({ mode, flatId, paymentTypeId, initialData }: PaymentTypeFormProps) {
  const navigation = useNavigation();
  const nameId = useId();
  const baseAmountId = useId();
  const nameErrorId = useId();
  const baseAmountErrorId = useId();
  const formErrorId = useId();

  const {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    updateField,
    setErrors,
    setSubmitting,
    setSuccess,
    validate,
  } = useFormState<PaymentTypeFormData>({
    initialData: {
      name: initialData?.name || '',
      baseAmount: initialData?.base_amount?.toString() || '',
    },
    validate: validatePaymentTypeForm,
  });

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('name', e.target.value);
  }, [updateField]);

  const handleBaseAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('baseAmount', e.target.value);
  }, [updateField]);

  const handleCancel = useCallback(() => {
    navigation.goToFlat(flatId);
  }, [flatId, navigation]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (!validate()) {
      // Focus first invalid field
      if (errors.name) {
        document.getElementById(nameId)?.focus();
      } else if (errors.base_amount) {
        document.getElementById(baseAmountId)?.focus();
      }
      return;
    }

    // Start submission
    setSubmitting(true);

    try {
      // Construct command
      const command: CreatePaymentTypeCommand | UpdatePaymentTypeCommand = {
        name: formData.name.trim(),
        base_amount: parseFloat(formData.baseAmount.trim()),
      };

      // API call
      const url = mode === 'create'
        ? `/api/flats/${flatId}/payment-types`
        : `/api/payment-types/${paymentTypeId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        // Handle error responses
        if (response.status === 400) {
          const errorData: ValidationErrorResponseDto = await response.json();
          setErrors({
            ...errorData.details,
            form: errorData.details ? undefined : errorData.error,
          });
          return;
        } else if (response.status === 401) {
          navigation.goToLogin(window.location.pathname);
          return;
        } else if (response.status === 404) {
          setErrors({
            form: "Payment type not found or you don't have permission to edit it.",
          });
          return;
        } else {
          const errorData = await response.json().catch(() => ({ error: 'An error occurred' }));
          setErrors({
            form: errorData.error || 'An error occurred while saving. Please try again.',
          });
          return;
        }
      }

      // Success
      const result: PaymentTypeDto = await response.json();

      if (mode === 'create') {
        navigation.goToFlat(flatId);
      } else {
        setSuccess(true);
        updateField('name', result.name);
        updateField('baseAmount', result.base_amount.toString());

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrors({
        form: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }, [mode, flatId, paymentTypeId, formData, errors, nameId, baseAmountId, validate, setSubmitting, setSuccess, setErrors, updateField, navigation]);

  const isFormValid = formData.name.trim().length > 0 && formData.baseAmount.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Form Error Message */}
      {errors.form && (
        <div
          id={formErrorId}
          role="alert"
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md"
        >
          <p className="text-sm font-medium">{errors.form}</p>
        </div>
      )}

      {/* Success Message (Edit Mode) */}
      {isSuccess && mode === 'edit' && (
        <div
          role="status"
          className="bg-green-50 dark:bg-green-950/30 border border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded-md"
        >
          <p className="text-sm font-medium">Payment type updated successfully!</p>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor={nameId} className="block text-sm font-medium">
          Name <span className="text-destructive">*</span>
        </label>
        <Input
          id={nameId}
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? nameErrorId : undefined}
          placeholder="e.g., Rent, Utilities, Internet"
          maxLength={100}
          disabled={isSubmitting}
          autoFocus
        />
        {errors.name && (
          <p id={nameErrorId} className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.name.length}/100 characters
        </p>
      </div>

      {/* Base Amount Field */}
      <div className="space-y-2">
        <label htmlFor={baseAmountId} className="block text-sm font-medium">
          Base Amount (PLN) <span className="text-destructive">*</span>
        </label>
        <Input
          id={baseAmountId}
          type="number"
          step="0.01"
          min="0"
          max="999999.99"
          value={formData.baseAmount}
          onChange={handleBaseAmountChange}
          aria-invalid={!!errors.base_amount}
          aria-describedby={errors.base_amount ? baseAmountErrorId : undefined}
          placeholder="e.g., 1500.00"
          disabled={isSubmitting}
        />
        {errors.base_amount && (
          <p id={baseAmountErrorId} className="text-sm text-destructive">
            {errors.base_amount}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          The default amount for this payment type
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </>
          ) : (
            mode === 'create' ? 'Create Payment Type' : 'Save Changes'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

