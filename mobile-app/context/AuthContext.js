import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check storage for existing token
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userStr = await SecureStore.getItemAsync('userData');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUserToken(token);
          setUserData(JSON.parse(userStr));
        }
      } catch (e) {
        console.warn('Fetching secure token failed', e);
      }
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await authenticate(data);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password, role: 'citizen' });
    await authenticate(data);
  };

  const authenticate = async (data) => {
    const { token, ...user } = data;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUserToken(token);
    setUserData(user);
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('userData', JSON.stringify(user));
  };

  const logout = async () => {
    delete api.defaults.headers.common['Authorization'];
    setUserToken(null);
    setUserData(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  };

  return (
    <AuthContext.Provider value={{ userToken, userData, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
