import { decodeToken } from '../utils/decodeToken';

export function useUserSession() {
  const decoded = decodeToken();

  return {
    user: {
      id: decoded?.id ?? null,
      role: decoded?.role ?? null,
    },
  };
}
