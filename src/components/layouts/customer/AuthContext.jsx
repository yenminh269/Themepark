import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load stored user from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("customer_info");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Listen for auth events from other parts of the app so we can update context immediately
  useEffect(() => {
    const handler = (e) => {
      if (e && e.detail) {
        setUser(e.detail);
      } else {
        const stored = localStorage.getItem("customer_info");
        setUser(stored ? JSON.parse(stored) : null);
      }
    };

    window.addEventListener('themepark:auth', handler);
    return () => window.removeEventListener('themepark:auth', handler);
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem("customer_info", JSON.stringify(user));
    } else {
      localStorage.removeItem("customer_info");
    }
  }, [user]);

  const signin = (userData) => {
    setUser(userData);
    localStorage.setItem("customer_info", JSON.stringify(userData));
    // Dispatch event to notify other parts of the app
    try {
      window.dispatchEvent(new CustomEvent('themepark:auth', { detail: userData }));
    } catch (error) {
      console.error('Auth notification error:', error);
    }
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("customer_info");
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
