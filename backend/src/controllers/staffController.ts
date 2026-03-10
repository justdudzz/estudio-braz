import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { syncHub } from '../utils/syncHub.js';
import { isValidNIF } from '../utils/nifValidator.js';
import logger from '../utils/logger.js';

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
          role: { in: ['ADMIN_STAFF', 'SUPER_ADMIN', 'ACCOUNTANT'] }
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
    const { 
      id, email, password, role, displayName, lastName, photoUrl, 
      legalName, businessName, nif, phone, birthDate, serviceIds 
    } = req.body;
    const requester = (req as any).user;
    
    // 🛡️ Validação Piquinhas de NIF
    if (nif && !isValidNIF(nif)) {
      return res.status(400).json({ error: 'O NIF fornecido é matematicamente inválido para Portugal.' });
    }
    
    try {
      // Se não houver ID, criamos uma nova funcionária
      if (!id) {
        if (!email) return res.status(400).json({ error: 'Email é obrigatório para novas contas' });
        
        const hashedPassword = await bcrypt.hash(password || 'Braz2026!', 12);
        
        const newUser = await (prisma.user as any).create({
          data: {
            email,
            password: hashedPassword,
            role: role || 'ADMIN_STAFF',
            displayName,
            lastName,
            photoUrl,
            birthDate,
            legalName,
            businessName,
            nif,
            phone,
            providedServices: {
              connect: serviceIds?.map((sid: string) => ({ id: sid })) || []
            }
          }
        });
        syncHub.notifyChange(`Nova funcionária: ${newUser.id}`);
        logger.info(`👤 NOVO TALENTO: ${newUser.email} criado por ${requester.email} (IP: ${req.ip})`);
        return res.status(201).json(newUser);
      }

      // Se houver ID, atualizamos
      const updateData: any = {
        displayName,
        lastName,
        photoUrl,
        birthDate,
        legalName,
        businessName,
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

      const updatedUser = await (prisma.user as any).update({
        where: { id },
        data: updateData
      });
      syncHub.notifyChange(`Funcionária atualizada: ${id}`);
      logger.info(`📝 STAFF EDITADO: ID ${id} atualizado por ${requester.email}`);
      res.json(updatedUser);
    } catch (error: any) {
      console.error('Erro no Upsert Staff:', error);
      res.status(400).json({ error: error.message || 'Erro ao processar dados da funcionária' });
    }
  },

  // 3. Eliminar funcionária
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    const requester = (req as any).user;
    try {
      await (prisma.user as any).delete({ where: { id } });
      syncHub.notifyChange(`Funcionária removida: ${id}`);
      logger.warn(`🗑️ ACESSO REVOGADO: Staff ID ${id} removido permanentemente por ${requester.email}`);
      res.json({ message: 'Funcionária removida com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover funcionária' });
    }
  }
};
