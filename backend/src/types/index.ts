// Definições de Elite que serão a lei do sistema
export interface IBooking {
  id?: string;
  date: string;
  time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  clientId: string;
  client?: IClient;
}

export interface IClient {
  id?: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  tier: 'Silver' | 'Gold' | 'VIP';
}