// src/hooks/useAuth.ts

import { useState, useCallback } from "react";
import { authApi } from "@/lib/api";

interface AuthUser {
  id: string;
  name: string;
  role: string;
  township?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { isAuthenticated: false, user: null };
      }
    }
    return { isAuthenticated: false, user: null };
  });

  const login = useCallback(async (accessToken: string): Promise<boolean> => {
    try {
      const response = await authApi.login(accessToken);

      // ✅ FIX: Store the actual token from the backend response
      localStorage.setItem("access_token", response.accessToken.token);

      const newState: AuthState = {
        isAuthenticated: true,
        user: {
          id: response.accessToken.id,
          name: response.accessToken.label,
          role: "admin",
          township: response.accessToken.township || undefined,
        },
      };

      setAuthState(newState);
      localStorage.setItem("auth", JSON.stringify(newState));
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, user: null });
    localStorage.removeItem("auth");
    localStorage.removeItem("access_token");
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    login,
    logout,
  };
};