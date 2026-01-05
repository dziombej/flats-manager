/**
 * UserMenu Component
 * Displays user email and logout button
 * TODO: Implement auth store integration and logout functionality
 */

interface UserMenuProps {
  user: {
    id: string;
    email: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const handleLogout = async () => {
    // TODO: Implement logout
    // - Call auth store logout function
    // - Auth store should:
    //   1. Call /api/auth/logout
    //   2. Clear user from store
    //   3. Redirect to /auth/login
    console.log('Logout clicked');
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right">
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
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
        <span className="hidden sm:inline">Log out</span>
      </button>
    </div>
  );
}

