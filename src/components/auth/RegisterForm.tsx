import { useState, useCallback, useId, type FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  };
  isSubmitting: boolean;
  isSuccess: boolean;
}

// Client-side validation
const validateForm = (
  email: string,
  password: string,
  confirmPassword: string
): { email?: string; password?: string; confirmPassword?: string } => {
  const errors: { email?: string; password?: string; confirmPassword?: string } = {};

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  // Confirm password validation
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export default function RegisterForm() {
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const confirmPasswordErrorId = useId();
  const formErrorId = useId();
  const successMessageId = useId();

  const [formState, setFormState] = useState<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    errors: {},
    isSubmitting: false,
    isSuccess: false,
  });

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      email: value,
      errors: {
        ...prev.errors,
        email: undefined,
      },
    }));
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      password: value,
      errors: {
        ...prev.errors,
        password: undefined,
      },
    }));
  }, []);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      confirmPassword: value,
      errors: {
        ...prev.errors,
        confirmPassword: undefined,
      },
    }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validateForm(
      formState.email,
      formState.password,
      formState.confirmPassword
    );

    if (Object.keys(validationErrors).length > 0) {
      setFormState(prev => ({
        ...prev,
        errors: validationErrors,
      }));
      return;
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      errors: {},
    }));

    try {
      // TODO: Implement API call to /api/auth/register
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: formState.email,
      //     password: formState.password,
      //   }),
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   const errorMessage = response.status === 409
      //     ? 'Email already exists'
      //     : data.error || 'Registration failed. Please try again.';
      //
      //   setFormState(prev => ({
      //     ...prev,
      //     errors: { form: errorMessage },
      //     isSubmitting: false,
      //   }));
      //   return;
      // }

      // On success: Show success message, then redirect to login
      // setFormState(prev => ({
      //   ...prev,
      //   isSubmitting: false,
      //   isSuccess: true,
      // }));

      // setTimeout(() => {
      //   window.location.href = '/auth/login';
      // }, 2000);

      console.log('Register form submitted', { email: formState.email });
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        errors: { form: 'An error occurred. Please try again.' },
        isSubmitting: false,
      }));
    }
  }, [formState.email, formState.password, formState.confirmPassword]);

  // Success message
  if (formState.isSuccess) {
    return (
      <div
        id={successMessageId}
        role="alert"
        className="rounded-md border border-primary bg-primary/10 p-4 text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
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
      {formState.errors.form && (
        <div
          id={formErrorId}
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive"
        >
          {formState.errors.form}
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
          value={formState.email}
          onChange={handleEmailChange}
          aria-invalid={!!formState.errors.email}
          aria-describedby={formState.errors.email ? emailErrorId : undefined}
          placeholder="your@email.com"
          disabled={formState.isSubmitting}
          autoComplete="email"
          required
        />
        {formState.errors.email && (
          <p id={emailErrorId} role="alert" className="text-sm text-destructive">
            {formState.errors.email}
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
          value={formState.password}
          onChange={handlePasswordChange}
          aria-invalid={!!formState.errors.password}
          aria-describedby={formState.errors.password ? passwordErrorId : undefined}
          placeholder="••••••••"
          disabled={formState.isSubmitting}
          autoComplete="new-password"
          required
        />
        {formState.errors.password && (
          <p id={passwordErrorId} role="alert" className="text-sm text-destructive">
            {formState.errors.password}
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
          value={formState.confirmPassword}
          onChange={handleConfirmPasswordChange}
          aria-invalid={!!formState.errors.confirmPassword}
          aria-describedby={formState.errors.confirmPassword ? confirmPasswordErrorId : undefined}
          placeholder="••••••••"
          disabled={formState.isSubmitting}
          autoComplete="new-password"
          required
        />
        {formState.errors.confirmPassword && (
          <p id={confirmPasswordErrorId} role="alert" className="text-sm text-destructive">
            {formState.errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}

