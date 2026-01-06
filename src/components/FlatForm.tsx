import { useCallback, useId, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useFormState } from "./hooks/useFormState";
import { useNavigation } from "./hooks/useNavigation";
import type { CreateFlatCommand, UpdateFlatCommand, FlatDto, ValidationErrorResponseDto } from "../types";

interface FlatFormProps {
  mode: "create" | "edit";
  flatId?: string;
  initialData?: {
    name: string;
    address: string;
  };
}

interface FlatFormData {
  name: string;
  address: string;
}

// Helper: Validate form
const validateFlatForm = (data: FlatFormData): { name?: string; address?: string } => {
  const errors: { name?: string; address?: string } = {};

  // Name validation
  const trimmedName = data.name.trim();
  if (trimmedName.length === 0) {
    errors.name = "Name is required";
  } else if (data.name.length > 100) {
    errors.name = "Name must be at most 100 characters";
  }

  // Address validation
  const trimmedAddress = data.address.trim();
  if (trimmedAddress.length === 0) {
    errors.address = "Address is required";
  } else if (data.address.length > 200) {
    errors.address = "Address must be at most 200 characters";
  }

  return errors;
};

export default function FlatForm({ mode, flatId, initialData }: FlatFormProps) {
  const navigation = useNavigation();
  const nameId = useId();
  const addressId = useId();
  const nameErrorId = useId();
  const addressErrorId = useId();
  const formErrorId = useId();

  const { formData, errors, isSubmitting, isSuccess, updateField, setErrors, setSubmitting, setSuccess, validate } =
    useFormState<FlatFormData>({
      initialData: {
        name: initialData?.name || "",
        address: initialData?.address || "",
      },
      validate: validateFlatForm,
    });

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField("name", e.target.value);
    },
    [updateField]
  );

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField("address", e.target.value);
    },
    [updateField]
  );

  const handleCancel = useCallback(() => {
    if (mode === "create") {
      navigation.goToFlats();
    } else if (flatId) {
      navigation.goToFlat(flatId);
    }
  }, [mode, flatId, navigation]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Client-side validation
      if (!validate()) {
        // Focus first invalid field
        if (errors.name) {
          document.getElementById(nameId)?.focus();
        } else if (errors.address) {
          document.getElementById(addressId)?.focus();
        }
        return;
      }

      // Start submission
      setSubmitting(true);

      try {
        // Construct command
        const command: CreateFlatCommand | UpdateFlatCommand = {
          name: formData.name.trim(),
          address: formData.address.trim(),
        };

        // API call
        const url = mode === "create" ? "/api/flats" : `/api/flats/${flatId}`;
        const method = mode === "create" ? "POST" : "PUT";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
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
              form: "Flat not found or you don't have permission to edit it.",
            });
            return;
          } else {
            const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
            setErrors({
              form: errorData.error || "An error occurred while saving. Please try again.",
            });
            return;
          }
        }

        // Success
        const result: FlatDto = await response.json();

        if (mode === "create") {
          navigation.goToFlat(result.id);
        } else {
          setSuccess(true);
          updateField("name", result.name);
          updateField("address", result.address);

          // Hide success message after 3 seconds
          setTimeout(() => {
            setSuccess(false);
          }, 3000);
        }
      } catch {
        setErrors({
          form: "Network error. Please check your connection and try again.",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      mode,
      flatId,
      formData,
      errors,
      nameId,
      addressId,
      validate,
      setSubmitting,
      setSuccess,
      setErrors,
      updateField,
      navigation,
    ]
  );

  const isFormValid = formData.name.trim().length > 0 && formData.address.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} data-test-id="flat-form" className="space-y-6 max-w-2xl">
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
      {isSuccess && mode === "edit" && (
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
          data-test-id="flat-name-input"
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? nameErrorId : undefined}
          placeholder="e.g., Apartment 101"
          maxLength={100}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p id={nameErrorId} className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{formData.name.length}/100 characters</p>
      </div>

      {/* Address Field */}
      <div className="space-y-2">
        <label htmlFor={addressId} className="block text-sm font-medium">
          Address <span className="text-destructive">*</span>
        </label>
        <Input
          id={addressId}
          data-test-id="flat-address-input"
          type="text"
          value={formData.address}
          onChange={handleAddressChange}
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? addressErrorId : undefined}
          placeholder="e.g., 123 Main St, City, ZIP"
          maxLength={200}
          disabled={isSubmitting}
        />
        {errors.address && (
          <p id={addressErrorId} className="text-sm text-destructive">
            {errors.address}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{formData.address.length}/200 characters</p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" data-test-id="flat-form-submit-button" disabled={isSubmitting || !isFormValid}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : mode === "create" ? (
            "Create Flat"
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
