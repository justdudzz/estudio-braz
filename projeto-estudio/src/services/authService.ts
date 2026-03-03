import api from './api';

export const loginDirector = async (email: string, password: string, twoFactorCode?: string) => {
  try {
    const payload = twoFactorCode ? { email, password, twoFactorCode } : { email, password };
    const response = await api.post('/auth/login', payload);

    // Se o backend pedir 2FA (Código 206 Partial Content)
    if (response.status === 206 || response.data?.requires2FA) {
      return { requires2FA: true };
    }

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