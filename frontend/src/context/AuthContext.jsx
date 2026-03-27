import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    const storedToken = localStorage.getItem('token');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('mockUser', JSON.stringify(userData));
    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = (profileData) => {
    const updatedUser = { ...user, ...profileData, profileComplete: true };
    setUser(updatedUser);
    localStorage.setItem('mockUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
