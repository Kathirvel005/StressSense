import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('stress_user');
    const token = localStorage.getItem('stress_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('stress_token', data.token);
      
      const userProfile = {
        username: data.username,
        email: data.email,
        role: data.role,
      };
      
      localStorage.setItem('stress_user', JSON.stringify(userProfile));
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username, email, password, role = 'USER') => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('stress_token', data.token);
      
      const userProfile = {
        username: data.username,
        email: data.email,
        role: data.role,
      };
      
      localStorage.setItem('stress_user', JSON.stringify(userProfile));
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('stress_token');
    localStorage.removeItem('stress_user');
    setUser(null);
  };

  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('stress_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 430) {
      logout();
      throw new Error('Session expired');
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, authFetch }}>
      {children}
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
