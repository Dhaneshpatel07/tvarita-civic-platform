import axios from 'axios';
import Constants from 'expo-constants';

// Automatically steal the computer's precise WiFi IP address from the Expo Development Server Manifest!
const debuggerHost = Constants.expoConfig?.hostUri;
const dynamicallyDiscoveredIP = debuggerHost ? debuggerHost.split(':')[0] : '10.35.204.72';

// Set the API URL based on environment or local fallback
const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://10.35.204.72:5000/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5-second strict timeout to prevent infinite buffering
});

export default api;
