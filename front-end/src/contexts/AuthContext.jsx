import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ตรวจสอบ authentication data ที่เก็บไว้ใน localStorage
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
          // มี user data ใน localStorage แล้ว ให้ restore
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } else {
          // ไม่มี user data ให้ clear เป็น null
          setUser(null);
        }
      } catch (error) {
        // กรณี localStorage มีปัญหา ให้ clear data
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
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