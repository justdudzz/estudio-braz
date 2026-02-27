import api from './api';

export const loginDirector = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.token) {
      // Guarda o token de forma segura para futuras consultas
      localStorage.setItem('braz_token', response.data.token);
      localStorage.setItem('braz_user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Erro na autenticação soberana.';
  }
};

export const logoutDirector = () => {
  localStorage.removeItem('braz_token');
  localStorage.removeItem('braz_user');
  window.location.href = '/login';
};