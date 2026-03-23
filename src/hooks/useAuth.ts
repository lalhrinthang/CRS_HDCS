import { useState,useCallback } from "react";

// Define the shape of the authentication context
interface AuthState {
    isAuthenticated: boolean;
    user: { name: string } | null;
}

// Hardcoded user credentials for demonstration purposes
// In a real application, you would replace this with API calls to your backend
const DEMO_CREDENTIALS = {
    username: "user",
    password: "password",
};

export const useAuth = () => {
  // Initialize state from localStorage (persist across page refreshes)
  const [authState, setAuthState] = useState<AuthState>(() => {
    // This function runs ONCE on first render (lazy initialization)
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If localStorage data is corrupted, start fresh
        return { isAuthenticated: false, user: null };
      }
    }
    return { isAuthenticated: false, user: null };
  });
  // Login function — wrapped in useCallback to prevent unnecessary re-renders
  const login = useCallback((username: string, password: string): boolean => {
    if (
      username === DEMO_CREDENTIALS.username &&
      password === DEMO_CREDENTIALS.password
    ) {
      const newState = { isAuthenticated: true, user: { name: username } };
      setAuthState(newState);
      localStorage.setItem("auth", JSON.stringify(newState));
      return true;  // Login succeeded
    }
    return false;  // Login failed
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, user: null });
    localStorage.removeItem("auth");
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    login,
    logout,
  };
};
