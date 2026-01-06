import { useState, useCallback, useId, type FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface LoginFormState {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
    form?: string;
  };
  isSubmitting: boolean;
}

// Client-side validation
const validateForm = (email: string, password: string): { email?: string; password?: string } => {
  const errors: { email?: string; password?: string } = {};

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
  }

  return errors;
};

export default function LoginForm() {
  const emailId = useId();
  const passwordId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const formErrorId = useId();

  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
    errors: {},
    isSubmitting: false,
  });

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState((prev) => ({
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
    setFormState((prev) => ({
      ...prev,
      password: value,
      errors: {
        ...prev.errors,
        password: undefined,
      },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Client-side validation
      const validationErrors = validateForm(formState.email, formState.password);
      if (Object.keys(validationErrors).length > 0) {
        setFormState((prev) => ({
          ...prev,
          errors: validationErrors,
        }));
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        errors: {},
      }));

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formState.email,
            password: formState.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setFormState((prev) => ({
            ...prev,
            errors: { form: data.error || "Invalid email or password" },
            isSubmitting: false,
          }));
          return;
        }

        // On success: Perform server-side page reload to update auth state
        window.location.href = "/dashboard";
      } catch {
        setFormState((prev) => ({
          ...prev,
          errors: { form: "An error occurred. Please try again." },
          isSubmitting: false,
        }));
      }
    },
    [formState.email, formState.password]
  );

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
          autoComplete="current-password"
          required
        />
        {formState.errors.password && (
          <p id={passwordErrorId} role="alert" className="text-sm text-destructive">
            {formState.errors.password}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
