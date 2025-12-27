import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token) {
        // 1. Optimistically set user from localStorage
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Failed to parse stored user:", e);
          }
        }

        // 2. Verify/Update with backend
        try {
          const user = await authService.getCurrentUser();
          if (user && (user.id || user.email)) {
            setUser(user);
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch (error) {
          console.error("Failed to fetch user on init:", error);
          // Don't logout here; let the axios interceptor handle 401s.
          // If it's a network error or ngrok warning, we keep the stored user.
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      const token = response.access || response.access_token || response.token;
      const refresh = response.refresh || response.refresh_token;
      const user = response.user;

      localStorage.setItem("token", token);
      if (refresh) localStorage.setItem("refresh", refresh);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return user;
      } else {
        // Fallback if user object is missing in login response
        const fetchedUser = await authService.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        setUser(fetchedUser);
        return fetchedUser;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
