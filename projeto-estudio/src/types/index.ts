export interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    tier: string;
    points: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    _count?: { bookings: number };
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'paid' | 'blocked' | 'rejected' | 'completed';

export interface Booking {
    id: string;
    clientId?: string;
    client?: Client;
    service: string;
    date: string;
    time: string;
    status: BookingStatus;
    notes?: string;
    extraServices?: string;
    totalPrice?: number;
    deletedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string; // YYYY-MM format
}
