import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Booking, Client, Expense } from '../src/types';
import api from '../src/services/api';
import { useToast } from '../components/common/Toast';

interface AdminDataContextProps {
    bookings: Booking[];
    clients: Client[];
    expenses: Expense[];
    loading: boolean;
    lastUpdate: number;
    selectedMonth: string; // "YYYY-MM"
    setSelectedMonth: (month: string) => void;
    refreshData: (background?: boolean) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    removeExpense: (id: string) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextProps | undefined>(undefined);

// Helper: Mês atual no formato "YYYY-MM"
const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const AdminDataProvider = ({ children }: { children: ReactNode }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // Rastreia os IDs conhecidos para detetar novos agendamentos no background
    const prevBookingsRef = useRef<Set<string>>(new Set());
    const isFirstLoad = useRef(true);
    const { showToast } = useToast();

    const refreshData = useCallback(async (background = false) => {
        try {
            if (!background) setLoading(true);

            // Calcular Janela de Tempo (Mês Atual e Mês Seguinte)
            const hoje = new Date();
            const startStr = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
            const endStr = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0).toISOString().split('T')[0];

            const [bookingsRes, clientsRes, expensesRes] = await Promise.all([
                api.get(`/bookings?startDate=${startStr}&endDate=${endStr}`),
                api.get('/bookings/clients?page=1&limit=50'),
                api.get(`/expenses?month=${selectedMonth}`),
            ]);

            const bk: Booking[] = Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.data || [];

            // Detetar agendamentos novos silent mode
            if (!isFirstLoad.current && background) {
                const currentIds = new Set(bk.map(b => b.id));
                const newIds = [...currentIds].filter(id => !prevBookingsRef.current.has(id));

                if (newIds.length > 0) {
                    const latestNewBooking = bk.find(b => b.id === newIds[0]);
                    if (latestNewBooking && latestNewBooking.status === 'pending') {
                        showToast(`🔔 Novo agendamento de ${latestNewBooking.client?.name || 'Cliente'} para ${latestNewBooking.date}!`, 'success');
                    }
                }
                prevBookingsRef.current = currentIds;
            } else if (isFirstLoad.current) {
                prevBookingsRef.current = new Set(bk.map(b => b.id));
                isFirstLoad.current = false;
            }

            setBookings(bk);

            const cl: Client[] = (clientsRes?.data || []).filter((c: any) => c.email !== 'system@studiobraz.internal');
            setClients(cl);

            const exp: Expense[] = expensesRes?.data || [];
            setExpenses(exp);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
            setLastUpdate(Date.now()); // Avisa toda a aplicação que os dados mudaram
        }
    }, [selectedMonth, showToast]);

    useEffect(() => {
        refreshData(false);
        // Auto-refresh a cada 15 segundos em modo silencioso (background)
        const interval = setInterval(() => refreshData(true), 15000);
        return () => clearInterval(interval);
    }, [refreshData]);

    const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
        try {
            const res = await api.post('/expenses', expense);
            setExpenses(prev => [res.data, ...prev]);
            setLastUpdate(Date.now());
        } catch (error) {
            console.error("Error adding expense:", error);
            throw error;
        }
    }, []);

    const removeExpense = useCallback(async (id: string) => {
        try {
            await api.delete(`/expenses/${id}`);
            setExpenses(prev => prev.filter(e => e.id !== id));
            setLastUpdate(Date.now());
        } catch (error) {
            console.error("Error removing expense:", error);
            throw error;
        }
    }, []);

    return (
        <AdminDataContext.Provider value={{
            bookings, clients, expenses, loading,
            lastUpdate, selectedMonth, setSelectedMonth,
            refreshData, addExpense, removeExpense
        }}>
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
