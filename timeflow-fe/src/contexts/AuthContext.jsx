import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Try to load user from sessionStorage first
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin' || parsedUser.ecNumber === 'admin');
        setLoading(false);
        return;
      }
  
      // Fetch if not in storage
      const decodedPayload = JSON.parse(atob(token.split('.')[1]));
      api.get(`/employees/${decodedPayload.ecNumber}`)
        .then((userData) => {
          setUser(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
          setIsAdmin(userData.role === 'admin' || userData.ecNumber === 'admin');
          setLoading(false);
        })
        .catch(() => {
          logout();
        });
    } else {
      // Clear storage on no token
      sessionStorage.removeItem('user');
      setLoading(false);
    }
  }, [token]);

  const login = async (token, initialUserData) => {
    sessionStorage.setItem('token', token);
    setToken(token);
  
    try {
      // Fetch full user profile from DB
      const fullUser = await api.get(`/employees/${initialUserData.ecNumber}`);
      setUser(fullUser);
      sessionStorage.setItem('user', JSON.stringify(fullUser));
      setIsAdmin(fullUser.role === 'admin' || fullUser.ecNumber === 'admin'); // Check for admin
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Fallback to initial data if fetch fails
      setUser(initialUserData);
      sessionStorage.setItem('user', JSON.stringify(initialUserData));
      setIsAdmin(initialUserData.role === 'admin' || initialUserData.ecNumber === 'admin');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    token,
    isAdmin,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
