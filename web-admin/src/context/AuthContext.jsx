import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem('adminData')) || null);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    
    if (data.role !== 'admin') {
      throw new Error("Access Denied: You do not have Web Administrator privileges.");
    }

    const { token: jwt, ...adminData } = data;
    localStorage.setItem('adminToken', jwt);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    
    api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
    setToken(jwt);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
