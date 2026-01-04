import { useState, useCallback, useId, type FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { CreateFlatCommand, UpdateFlatCommand, FlatDto, ValidationErrorResponseDto } from "../types";

interface FlatFormProps {
  mode: 'create' | 'edit';
  flatId?: string;
  initialData?: {
    name: string;
    address: string;
  };
}

interface FlatFormState {
  name: string;
  address: string;
  errors: {
    name?: string;
    address?: string;
    form?: string;
  };
  isSubmitting: boolean;
  isSuccess: boolean;
}

// Helper: Validate form
const validateForm = (name: string, address: string): { name?: string; address?: string } => {
  const errors: { name?: string; address?: string } = {};

  // Name validation
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    errors.name = "Name is required";
  } else if (name.length > 100) {
    errors.name = "Name must be at most 100 characters";
  }

  // Address validation
  const trimmedAddress = address.trim();
  if (trimmedAddress.length === 0) {
    errors.address = "Address is required";
  } else if (address.length > 200) {
    errors.address = "Address must be at most 200 characters";
  }

  return errors;
};

export default function FlatForm({ mode, flatId, initialData }: FlatFormProps) {
  const nameId = useId();
  const addressId = useId();
  const nameErrorId = useId();
  const addressErrorId = useId();
  const formErrorId = useId();

  const [formState, setFormState] = useState<FlatFormState>({
    name: initialData?.name || '',
    address: initialData?.address || '',
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

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      address: value,
      errors: {
        ...prev.errors,
        address: undefined,
      },
    }));
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'create') {
      window.location.href = '/flats';
    } else {
      window.location.href = `/flats/${flatId}`;
    }
  }, [mode, flatId]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validateForm(formState.name, formState.address);

    if (Object.keys(validationErrors).length > 0) {
      setFormState(prev => ({
        ...prev,
        errors: validationErrors,
      }));

      // Focus first invalid field
      if (validationErrors.name) {
        document.getElementById(nameId)?.focus();
      } else if (validationErrors.address) {
        document.getElementById(addressId)?.focus();
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
      const command: CreateFlatCommand | UpdateFlatCommand = {
        name: formState.name.trim(),
        address: formState.address.trim(),
      };

      // API call
      const url = mode === 'create' ? '/api/flats' : `/api/flats/${flatId}`;
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
              form: "Flat not found or you don't have permission to edit it.",
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
      const result: FlatDto = await response.json();

      if (mode === 'create') {
        // Redirect to flat details page
        window.location.href = `/flats/${result.id}`;
      } else {
        // Show success message in edit mode
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          isSuccess: true,
          name: result.name,
          address: result.address,
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
  }, [mode, flatId, formState.name, formState.address, nameId, addressId]);

  const hasErrors = Object.keys(formState.errors).length > 0;
  const isFormValid = formState.name.trim().length > 0 && formState.address.trim().length > 0;

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
          <p className="text-sm font-medium">Flat updated successfully!</p>
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
          placeholder="e.g., Apartment 101"
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

      {/* Address Field */}
      <div className="space-y-2">
        <label htmlFor={addressId} className="block text-sm font-medium">
          Address <span className="text-destructive">*</span>
        </label>
        <Input
          id={addressId}
          type="text"
          value={formState.address}
          onChange={handleAddressChange}
          aria-invalid={!!formState.errors.address}
          aria-describedby={formState.errors.address ? addressErrorId : undefined}
          placeholder="e.g., 123 Main St, City, ZIP"
          maxLength={200}
          disabled={formState.isSubmitting}
        />
        {formState.errors.address && (
          <p id={addressErrorId} className="text-sm text-destructive">
            {formState.errors.address}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formState.address.length}/200 characters
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
            mode === 'create' ? 'Create Flat' : 'Save Changes'
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

