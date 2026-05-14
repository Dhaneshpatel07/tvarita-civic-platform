import axios from 'axios';
import Constants from 'expo-constants';

// Automatically steal the computer's precise WiFi IP address from the Expo Development Server Manifest!
const debuggerHost = Constants.expoConfig?.hostUri;
const dynamicallyDiscoveredIP = debuggerHost ? debuggerHost.split(':')[0] : '10.110.149.77';

// Set the API URL based on environment or local fallback
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://tvarita-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30-second timeout to handle Render free-tier cold starts
});

export default api;
