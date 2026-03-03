// frontend/src/services/api.ts
import axios from 'axios';

// 1. Criação da ligação com a base URL inteligente
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔐 Envia cookies httpOnly automaticamente (#1)
});

// 2. Intercetor de Pedidos — Adiciona CSRF token (#5)
api.interceptors.request.use((config) => {
  // Ler o CSRF token do cookie (não-httpOnly, legível pelo JS)
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('braz_csrf='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
  }

  return config;
});

// 3. 🚀 Gestor de Erro 401 — Redirect para login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpa dados do utilizador (o cookie httpOnly é gerido pelo servidor)
      localStorage.removeItem('braz_user');
      localStorage.removeItem('braz_expires_at');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;