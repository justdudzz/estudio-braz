import api from './api';

// Interface rígida para garantir que os dados estão sempre corretos
export interface BookingData {
  name: string;
  email?: string | null;
  phone?: string | null;
  serviceIds: string[];
  staffId: string;
  date: string;
  time: string;
  clientId?: string;
}

export const createNewBooking = async (bookingData: BookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Lamentamos, mas ocorreu um imprevisto na nossa ligação de elite. Por favor, tente novamente.';
  }
};

export const getBusySlots = async (date: string, staffId: string, clientId?: string) => {
  try {
    const response = await api.get('/bookings/busy-slots', {
      params: { date, staffId, clientId }
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Não foi possível carregar os horários disponíveis.';
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
export const updateBookingStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'paid' | 'pending' | 'blocked', totalPrice?: number) => {
  const response = await api.patch(`/bookings/${id}/status`, { status, totalPrice });
  return response.data;
};
export const deleteBooking = async (id: string) => {
  await api.delete(`/bookings/${id}`);
};

export const getStaffWithServices = async () => {
  try {
    const response = await api.get('/staff/services');
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Não foi possível carregar a equipa de elite.';
  }
};

export const restoreBooking = async (id: string) => {
  const response = await api.patch(`/bookings/${id}/restore`);
  return response.data;
};