import api from './api';

// Interface rígida para garantir que os dados estão sempre corretos
export interface BookingData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
}

export const createNewBooking = async (bookingData: BookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Erro ao comunicar com o servidor soberano.';
  }
};

export const getAllBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Erro ao carregar a agenda soberana.';
  }
};