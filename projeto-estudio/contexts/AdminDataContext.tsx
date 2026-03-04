import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Booking, Client, Expense } from '../src/types';
import api from '../src/services/api';

interface AdminDataContextProps {
    bookings: Booking[];
    clients: Client[];
    expenses: Expense[];
    loading: boolean;
    refreshData: () => Promise<void>;
    addExpense: (expense: Expense) => void;
    removeExpense: (id: string) => void;
}

const AdminDataContext = createContext<AdminDataContextProps | undefined>(undefined);

const EXPENSES_KEY = 'studiobraz_expenses';

export const AdminDataProvider = ({ children }: { children: ReactNode }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    // Load expenses from localStorage initially
    useEffect(() => {
        try {
            const stored = localStorage.getItem(EXPENSES_KEY);
            if (stored) setExpenses(JSON.parse(stored));
        } catch {
            console.error('Failed to parse expenses');
        }
    }, []);

    const refreshData = useCallback(async () => {
        try {
            setLoading(true);

            // Calcular Janela de Tempo (Mês Atual e Mês Seguinte)
            const hoje = new Date();
            const startStr = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
            const endStr = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0).toISOString().split('T')[0];

            const [bookingsRes, clientsRes] = await Promise.all([
                api.get(`/bookings?startDate=${startStr}&endDate=${endStr}`),
                api.get('/bookings/clients?page=1&limit=50') // Initial load: Top 50 clients
            ]);

            const bk: Booking[] = Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.data || [];
            setBookings(bk);

            const cl: Client[] = (clientsRes?.data || []).filter((c: any) => c.email !== 'system@studiobraz.internal');
            setClients(cl);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
        // Auto-refresh a cada 30 segundos para visibilidade em tempo real
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, [refreshData]);

    const addExpense = useCallback((expense: Expense) => {
        setExpenses(prev => {
            const updated = [expense, ...prev];
            localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const removeExpense = useCallback((id: string) => {
        setExpenses(prev => {
            const updated = prev.filter(e => e.id !== id);
            localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <AdminDataContext.Provider value={{ bookings, clients, expenses, loading, refreshData, addExpense, removeExpense }}>
            {children}
        </AdminDataContext.Provider>
    );
};

export const useAdminData = () => {
    const context = useContext(AdminDataContext);
    if (context === undefined) {
        throw new Error('useAdminData must be used within an AdminDataProvider');
    }
    return context;
};
