// frontend/src/services/api.ts
import axios from 'axios';

// 1. Criação da ligação com a base URL inteligente
const api = axios.create({
  // Procura a variável de ambiente VITE_API_URL.
  // Se estiver online, usa essa. Se não encontrar (no teu PC), usa o localhost!
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Intercetor de Pedidos (O Porteiro de Entrada)
// Antes de qualquer pedido ir para o servidor, verifica se temos um token.
api.interceptors.request.use((config) => {
  // Vai procurar a "chave" (token) guardada na memória do navegador
  const token = localStorage.getItem('braz_token');
  
  // Se o token existir, anexa-o ao cabeçalho
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. 🚀 AUTOMAÇÃO DE SEGURANÇA (O Porteiro de Saída / Gestor de Erro 401)
// Analisa a resposta do servidor antes de a entregar à aplicação.
api.interceptors.response.use(
  // Se correr tudo bem, devolve a resposta normalmente
  (response) => response,
  
  // Se houver um erro...
  (error) => {
    // Verifica se o servidor disse que não estamos autorizados (Erro 401)
    if (error.response?.status === 401) {
      // Limpa a chave caducada ou inválida da memória
      localStorage.removeItem('braz_token'); 
      
      // Redireciona automaticamente para a página de login, caso ainda não estejamos lá
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    // Devolve o erro para que a aplicação saiba que algo falhou (ex: para mostrar um alerta)
    return Promise.reject(error);
  }
);

export default api;