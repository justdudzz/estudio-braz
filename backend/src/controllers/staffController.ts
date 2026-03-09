import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

/**
 * Controller para Gestão de Equipa (Staff)
 * Permite que a Super Admin (Mariana) faça tudo o que você pediu.
 */
export const StaffController = {
  // 1. Listar todas as funcionárias com os seus serviços
  getAll: async (req: Request, res: Response) => {
    try {
      const staff = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN_STAFF', 'SUPER_ADMIN'] }
        },
        include: {
          providedServices: {
            select: { id: true, name: true, label: true }
          }
        },
        orderBy: { displayName: 'asc' }
      });
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar equipa' });
    }
  },

  // 2. Criar ou Atualizar uma funcionária (Foto, Nome, NIF, etc)
  upsert: async (req: Request, res: Response) => {
    const { id, email, password, role, displayName, photoUrl, legalName, nif, phone, serviceIds } = req.body;
    
    try {
      // Se não houver ID, criamos uma nova funcionária
      if (!id) {
        if (!email) return res.status(400).json({ error: 'Email é obrigatório para novas contas' });
        
        const hashedPassword = await bcrypt.hash(password || 'Braz2026!', 12);
        
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: role || 'ADMIN_STAFF',
            displayName,
            photoUrl,
            legalName,
            nif,
            phone,
            providedServices: {
              connect: serviceIds?.map((sid: string) => ({ id: sid })) || []
            }
          }
        });
        return res.status(201).json(newUser);
      }

      // Se houver ID, atualizamos
      const updateData: any = {
        displayName,
        photoUrl,
        legalName,
        nif,
        phone,
        providedServices: {
          set: [], // Limpa serviços anteriores
          connect: serviceIds?.map((sid: string) => ({ id: sid })) || []
        }
      };

      // Se enviarem uma nova password na edição
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });
      res.json(updatedUser);
    } catch (error: any) {
      console.error('Erro no Upsert Staff:', error);
      res.status(400).json({ error: error.message || 'Erro ao processar dados da funcionária' });
    }
  },

  // 3. Eliminar funcionária
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.user.delete({ where: { id } });
      res.json({ message: 'Funcionária removida com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover funcionária' });
    }
  }
};
