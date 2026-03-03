import api from './api';

export const loginDirector = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    // O token agora é enviado como httpOnly cookie pelo servidor (#1)
    // Não precisamos guardá-lo no localStorage — apenas retornar os dados
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Erro na autenticação.';
  }
};

export const logoutDirector = async () => {
  try {
    // Chamar o servidor para limpar o cookie httpOnly (#13)
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Erro ao fazer logout:', err);
  }
  localStorage.removeItem('braz_user');
  localStorage.removeItem('braz_expires_at');
  window.location.href = '/login';
};