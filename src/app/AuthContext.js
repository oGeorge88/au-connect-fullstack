// src/app/AuthContext.js
"use client";
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(''); // Track user role
  const [userId, setUserId] = useState(null); // Track user ID
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    try {
      // Simulate fetching authentication state from localStorage
      const loggedIn = localStorage.getItem('isLoggedIn');
      const storedRole = localStorage.getItem('role');
      const storedUserId = localStorage.getItem('userId');

      if (loggedIn === 'true') {
        setIsLoggedIn(true);
        setRole(storedRole || '');
        setUserId(storedUserId || null);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    } finally {
      // Once the state is loaded from localStorage, stop loading
      setLoading(false);
    }
  }, []);

  const login = ({ role, userId }) => {
    setIsLoggedIn(true);
    setRole(role);
    setUserId(userId);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setRole('');
    setUserId(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, role, userId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
