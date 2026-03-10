import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
/**
 * GET /expenses?month=2026-03
 * Lista despesas de um mês específico (ou todas se não for enviado filtro)
 */
export const getExpenses = async (req, res) => {
    try {
        const month = req.query.month;
        const where = {};
        if (month)
            where.date = month;
        const expenses = await prisma.expense.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 200, // Safety limit
        });
        res.json(expenses);
    }
    catch (error) {
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
export const createExpense = async (req, res) => {
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
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao criar despesa.' });
    }
};
/**
 * DELETE /expenses/:id
 * Remover uma despesa
 */
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.expense.delete({ where: { id } });
        res.json({ message: 'Despesa removida.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao remover despesa.' });
    }
};
