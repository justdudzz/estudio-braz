import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
import { syncHub } from '../utils/syncHub.js';

export const PortfolioController = {
  // 1. Listar todas as obras
  getAll: async (req: Request, res: Response) => {
    try {
      const items = await (prisma as any).portfolioItem.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar portfólio' });
    }
  },

  // 2. Criar nova obra (Modo Diretora)
  create: async (req: Request, res: Response) => {
    const { src, label, category } = req.body;
    try {
      if (!src || !label || !category) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }
      const newItem = await (prisma as any).portfolioItem.create({
        data: { src, label, category }
      });
      syncHub.notifyChange(`Novo item no portfólio: ${newItem.id}`);
      logger.info(`📸 Novo item adicionado ao portfólio: ${label}`);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao adicionar ao portfólio' });
    }
  },

  // 3. Eliminar obra (Modo Diretora)
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await (prisma as any).portfolioItem.delete({ where: { id } });
      syncHub.notifyChange(`Item removido do portfólio: ${id}`);
      logger.info(`📸 Item removido do portfólio: ${id}`);
      res.json({ message: 'Obra eliminada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover do portfólio' });
    }
  }
};
