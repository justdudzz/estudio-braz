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
    throw error.response?.data?.message || 'Lamentamos, mas ocorreu um imprevisto na nossa ligação de elite. Por favor, tente novamente.';
  }
};

export const getAllBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Lamentamos, mas não foi possível preparar o seu menu de reservas de elite neste momento.';
  }
};
export const updateBookingStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'paid' | 'pending' | 'blocked') => {
  const response = await api.patch(`/bookings/${id}/status`, { status });
  return response.data;
};
export const deleteBooking = async (id: string) => {
  await api.delete(`/bookings/${id}`);
};

export const restoreBooking = async (id: string) => {
  const response = await api.patch(`/bookings/${id}/restore`);
  return response.data;
};