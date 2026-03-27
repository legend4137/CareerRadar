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
    
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      // Fetch latest profile to ensure data like 'name' is synced
      axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`)
        .then(response => {
          const userData = response.data;
          setUser(userData);
          localStorage.setItem('mockUser', JSON.stringify(userData));
        })
        .catch(err => {
          console.error("Failed to sync profile:", err);
          if (storedUser) setUser(JSON.parse(storedUser));
        })
        .finally(() => setLoading(false));
    } else {
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    }
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
