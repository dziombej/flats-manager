/**
 * Custom hook for navigation operations
 * Centralizes navigation logic for better testability and maintainability
 */

interface NavigationHook {
  goToFlat: (flatId: string) => void;
  goToFlats: () => void;
  goToFlatWithParams: (flatId: string, params: Record<string, string | number>) => void;
  goToLogin: (returnTo?: string) => void;
  reload: () => void;
}

export const useNavigation = (): NavigationHook => {
  const goToFlat = (flatId: string) => {
    window.location.href = `/flats/${flatId}`;
  };

  const goToFlats = () => {
    window.location.href = "/flats";
  };

  const goToFlatWithParams = (flatId: string, params: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });
    window.location.href = `/flats/${flatId}?${searchParams.toString()}`;
  };

  const goToLogin = (returnTo?: string) => {
    const returnUrl = returnTo || window.location.pathname;
    window.location.href = `/auth/login?returnTo=${encodeURIComponent(returnUrl)}`;
  };

  const reload = () => {
    window.location.reload();
  };

  return {
    goToFlat,
    goToFlats,
    goToFlatWithParams,
    goToLogin,
    reload,
  };
};
