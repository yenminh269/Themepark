import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load stored user from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("themepark_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Listen for auth events from other parts of the app so we can update context immediately
  useEffect(() => {
    const handler = (e) => {
      if (e && e.detail) {
        setUser(e.detail);
      } else {
        const stored = localStorage.getItem("themepark_user");
        setUser(stored ? JSON.parse(stored) : null);
      }
    };

    window.addEventListener('themepark:auth', handler);
    return () => window.removeEventListener('themepark:auth', handler);
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem("themepark_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("themepark_user");
    }
  }, [user]);

  const signin = (email, password) => {
    // Mock login — real logic will use backend later
    const newUser = { email, firstName: "John", lastName: "Doe" };
    setUser(newUser);
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("themepark_user");
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
