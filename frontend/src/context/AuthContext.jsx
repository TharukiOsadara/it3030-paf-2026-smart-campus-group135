import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("sc_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await res.json();
      const userData = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token
      };

      setUser(userData);
      localStorage.setItem("sc_token", data.token);
      localStorage.setItem("sc_user_id", data.userId);
      localStorage.setItem("sc_user_role", data.role);
      localStorage.setItem("sc_user", JSON.stringify(userData));

      return { user: userData };
    } catch (error) {
      return { error };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("sc_token");
    localStorage.removeItem("sc_user_id");
    localStorage.removeItem("sc_user_role");
    localStorage.removeItem("sc_user");
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;