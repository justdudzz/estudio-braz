import axios from 'axios';

const api = axios.create({
  // Mudamos para o endereço fixo do seu servidor local para evitar confusão
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona o token automaticamente em cada chamada se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('braz_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;