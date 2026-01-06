/**
 * UserMenu Component
 * Displays user email and logout button
 */

import { useState, useCallback } from "react";

interface UserMenuProps {
  user: {
    id: string;
    email: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setIsLoggingOut(false);
        return;
      }

      // Redirect to login page (server-side reload)
      window.location.href = "/auth/login";
    } catch {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right">
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Log out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Log out"}</span>
      </button>
    </div>
  );
}
