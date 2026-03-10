import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
import { syncHub } from '../utils/syncHub.js';

/**
 * GET /expenses?month=2026-03
 * Lista despesas de um mês específico (ou todas se não for enviado filtro)
 */
export const getExpenses = async (req: Request, res: Response) => {
    try {
        const month = req.query.month as string | undefined;
        const where: any = {};
        if (month) where.date = month;

        const expenses = await prisma.expense.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 200, // Safety limit
        });

        res.json(expenses);
    } catch (error: any) {
        logger.error("Erro ao carregar despesas:", {
            message: error.message,
            stack: error.stack,
            query: req.query
        });
        res.status(500).json({ message: 'Erro ao carregar despesas.' });
    }
};

/**
 * POST /expenses
 * Criar uma nova despesa
 */
export const createExpense = async (req: Request, res: Response) => {
    try {
        const { description, amount, date } = req.body;

        if (!description || amount == null || !date) {
            return res.status(400).json({ message: 'Descrição, valor e mês são obrigatórios.' });
        }

        const expense = await prisma.expense.create({
            data: {
                description: String(description).trim(),
                amount: Number(amount),
                date: String(date), // "YYYY-MM"
            },
        });
        
        syncHub.notifyChange(`Nova despesa: ${expense.id}`);
        res.status(201).json(expense);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao criar despesa.' });
    }
};

/**
 * DELETE /expenses/:id
 * Remover uma despesa
 */
export const deleteExpense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.expense.delete({ where: { id } });
        syncHub.notifyChange(`Despesa removida: ${id}`);
        res.json({ message: 'Despesa removida.' });
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao remover despesa.' });
    }
};
