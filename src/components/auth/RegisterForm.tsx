import { useCallback, useId, type FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useFormState } from "../hooks/useFormState";
import { useNavigation } from "../hooks/useNavigation";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Client-side validation
const validateRegisterForm = (data: RegisterFormData): { email?: string; password?: string; confirmPassword?: string } => {
  const errors: { email?: string; password?: string; confirmPassword?: string } = {};

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export default function RegisterForm() {
  const navigation = useNavigation();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const confirmPasswordErrorId = useId();
  const formErrorId = useId();
  const successMessageId = useId();

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
  } = useFormState<RegisterFormData>({
    initialData: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: validateRegisterForm,
  });

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('email', e.target.value);
  }, [updateField]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('password', e.target.value);
  }, [updateField]);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('confirmPassword', e.target.value);
  }, [updateField]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || 'Registration failed. Please try again.' });
        return;
      }

      // On success: Show success message, then redirect to login
      setSuccess(true);

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ form: 'An error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }, [formData.email, formData.password, validate, setSubmitting, setSuccess, setErrors]);

  // Success message
  if (isSuccess) {
    return (
      <div
        id={successMessageId}
        role="alert"
        className="rounded-md border border-primary bg-primary/10 p-4 text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <div>
            <h3 className="font-semibold text-lg mb-1">Account created successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Form-level error */}
      {errors.form && (
        <div
          id={formErrorId}
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive"
        >
          {errors.form}
        </div>
      )}

      {/* Email field */}
      <div className="space-y-2">
        <label htmlFor={emailId} className="text-sm font-medium leading-none">
          Email
        </label>
        <Input
          id={emailId}
          type="email"
          value={formData.email}
          onChange={handleEmailChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? emailErrorId : undefined}
          placeholder="your@email.com"
          disabled={isSubmitting}
          autoComplete="email"
          required
        />
        {errors.email && (
          <p id={emailErrorId} role="alert" className="text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <label htmlFor={passwordId} className="text-sm font-medium leading-none">
          Password
        </label>
        <Input
          id={passwordId}
          type="password"
          value={formData.password}
          onChange={handlePasswordChange}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? passwordErrorId : undefined}
          placeholder="••••••••"
          disabled={isSubmitting}
          autoComplete="new-password"
          required
        />
        {errors.password && (
          <p id={passwordErrorId} role="alert" className="text-sm text-destructive">
            {errors.password}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum 8 characters
        </p>
      </div>

      {/* Confirm Password field */}
      <div className="space-y-2">
        <label htmlFor={confirmPasswordId} className="text-sm font-medium leading-none">
          Confirm Password
        </label>
        <Input
          id={confirmPasswordId}
          type="password"
          value={formData.confirmPassword}
          onChange={handleConfirmPasswordChange}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? confirmPasswordErrorId : undefined}
          placeholder="••••••••"
          disabled={isSubmitting}
          autoComplete="new-password"
          required
        />
        {errors.confirmPassword && (
          <p id={confirmPasswordErrorId} role="alert" className="text-sm text-destructive">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}

