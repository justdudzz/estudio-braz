import axios from 'axios';

// Cria a ponte de ligação com o Backend
const api = axios.create({
  // Se a variável VITE não estiver carregada, tenta a porta 5000 por defeito
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercetor de Pedido: Injeta o "Token de Elite" antes de qualquer chamada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('braz_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercetor de Resposta (Correção Ponto 14): Expulsão suave se o token for inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Acesso Mestre expirado ou inválido. Bloqueio ativado.");
      localStorage.removeItem('braz_token');
      localStorage.removeItem('braz_user');
      window.location.href = '/login'; // Redireciona para a porta de entrada
    }
    return Promise.reject(error);
  }
);

export default api;