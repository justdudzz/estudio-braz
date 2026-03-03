import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Booking, Client, Expense } from '../src/types';
import { getAllBookings } from '../src/services/bookingService';
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
            const [bookingsRes, clientsRes] = await Promise.all([
                getAllBookings(),
                api.get('/bookings/clients')
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
        // Refresh periodically or rely on manual refresh triggers?
        // Let's rely on manual triggers when mutations happen to save network calls.
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
