import { useState, useCallback, useId, type FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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

interface PaymentTypeFormState {
  name: string;
  baseAmount: string;
  errors: {
    name?: string;
    base_amount?: string;
    form?: string;
  };
  isSubmitting: boolean;
  isSuccess: boolean;
}

// Helper: Validate form
const validateForm = (name: string, baseAmount: string): { name?: string; base_amount?: string } => {
  const errors: { name?: string; base_amount?: string } = {};

  // Name validation
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    errors.name = "Name is required";
  } else if (name.length > 100) {
    errors.name = "Name must be at most 100 characters";
  }

  // Base amount validation
  const trimmedAmount = baseAmount.trim();
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
  const nameId = useId();
  const baseAmountId = useId();
  const nameErrorId = useId();
  const baseAmountErrorId = useId();
  const formErrorId = useId();

  const [formState, setFormState] = useState<PaymentTypeFormState>({
    name: initialData?.name || '',
    baseAmount: initialData?.base_amount?.toString() || '',
    errors: {},
    isSubmitting: false,
    isSuccess: false,
  });

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      name: value,
      errors: {
        ...prev.errors,
        name: undefined,
      },
    }));
  }, []);

  const handleBaseAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      baseAmount: value,
      errors: {
        ...prev.errors,
        base_amount: undefined,
      },
    }));
  }, []);

  const handleCancel = useCallback(() => {
    window.location.href = `/flats/${flatId}`;
  }, [flatId]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validateForm(formState.name, formState.baseAmount);

    if (Object.keys(validationErrors).length > 0) {
      setFormState(prev => ({
        ...prev,
        errors: validationErrors,
      }));

      // Focus first invalid field
      if (validationErrors.name) {
        document.getElementById(nameId)?.focus();
      } else if (validationErrors.base_amount) {
        document.getElementById(baseAmountId)?.focus();
      }

      return;
    }

    // Start submission
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      errors: {},
      isSuccess: false,
    }));

    try {
      // Construct command
      const command: CreatePaymentTypeCommand | UpdatePaymentTypeCommand = {
        name: formState.name.trim(),
        base_amount: parseFloat(formState.baseAmount.trim()),
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
          // Validation error
          const errorData: ValidationErrorResponseDto = await response.json();
          setFormState(prev => ({
            ...prev,
            isSubmitting: false,
            errors: {
              ...errorData.details,
              form: errorData.details ? undefined : errorData.error,
            },
          }));
          return;
        } else if (response.status === 401) {
          // Unauthorized - redirect to login
          window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
          return;
        } else if (response.status === 404) {
          // Not found (edit mode)
          setFormState(prev => ({
            ...prev,
            isSubmitting: false,
            errors: {
              form: "Payment type not found or you don't have permission to edit it.",
            },
          }));
          return;
        } else {
          // Other errors
          const errorData = await response.json().catch(() => ({ error: 'An error occurred' }));
          setFormState(prev => ({
            ...prev,
            isSubmitting: false,
            errors: {
              form: errorData.error || 'An error occurred while saving. Please try again.',
            },
          }));
          return;
        }
      }

      // Success
      const result: PaymentTypeDto = await response.json();

      if (mode === 'create') {
        // Redirect to flat details page
        window.location.href = `/flats/${flatId}`;
      } else {
        // Show success message in edit mode
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          isSuccess: true,
          name: result.name,
          baseAmount: result.base_amount.toString(),
        }));

        // Hide success message after 3 seconds
        setTimeout(() => {
          setFormState(prev => ({
            ...prev,
            isSuccess: false,
          }));
        }, 3000);
      }
    } catch (error) {
      // Network error
      console.error('Network error:', error);
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: {
          form: 'Network error. Please check your connection and try again.',
        },
      }));
    }
  }, [mode, flatId, paymentTypeId, formState.name, formState.baseAmount, nameId, baseAmountId]);

  const isFormValid = formState.name.trim().length > 0 && formState.baseAmount.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Form Error Message */}
      {formState.errors.form && (
        <div
          id={formErrorId}
          role="alert"
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md"
        >
          <p className="text-sm font-medium">{formState.errors.form}</p>
        </div>
      )}

      {/* Success Message (Edit Mode) */}
      {formState.isSuccess && mode === 'edit' && (
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
          value={formState.name}
          onChange={handleNameChange}
          aria-invalid={!!formState.errors.name}
          aria-describedby={formState.errors.name ? nameErrorId : undefined}
          placeholder="e.g., Rent, Utilities, Internet"
          maxLength={100}
          disabled={formState.isSubmitting}
          autoFocus
        />
        {formState.errors.name && (
          <p id={nameErrorId} className="text-sm text-destructive">
            {formState.errors.name}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formState.name.length}/100 characters
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
          value={formState.baseAmount}
          onChange={handleBaseAmountChange}
          aria-invalid={!!formState.errors.base_amount}
          aria-describedby={formState.errors.base_amount ? baseAmountErrorId : undefined}
          placeholder="e.g., 1500.00"
          disabled={formState.isSubmitting}
        />
        {formState.errors.base_amount && (
          <p id={baseAmountErrorId} className="text-sm text-destructive">
            {formState.errors.base_amount}
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
          disabled={formState.isSubmitting || !isFormValid}
        >
          {formState.isSubmitting ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
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
          disabled={formState.isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

