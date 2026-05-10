import axios from 'axios';

// Change this to your live deployed backend URL via .env (e.g., Render/Heroku)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;
