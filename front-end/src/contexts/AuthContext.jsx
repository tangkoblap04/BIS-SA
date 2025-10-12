import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear localStorage เพื่อให้เริ่มต้นด้วยหน้า login เสมอ
    const initAuth = () => {
      // Clear existing authentication data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();

      // Set user เป็น null เสมอ เพื่อให้เริ่มต้นด้วยหน้า login
      setUser(null);
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      // Update state
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUserProfile,
        isHR: () => user?.role === 'HR',
        isEmployee: () => user?.role === 'employee'
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};