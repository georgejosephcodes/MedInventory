import { createContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../lib/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth on refresh
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (token && role) {
        setUser({ role: JSON.parse(role) });
      }
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiLogin({ email, password });
      const { token, role } = res.data;

      if (!token || !role) {
        return { success: false, error: 'Invalid response' };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', JSON.stringify(role));

      setUser({ role });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const hasRole = (roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        login,
        logout,
        hasRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
