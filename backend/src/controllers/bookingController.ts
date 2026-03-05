// backend/src/controllers/bookingController.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
import { sendLuxuryEmail } from '../services/emailService.js';
import { sendNotification } from '../services/notificationService.js';
import { createBookingSchema } from '../schemas/bookingSchema.js';
import { BUSINESS_HOURS, SERVICES_CONFIG } from '../config/businessRules.js';

// 🛠️ DICIONÁRIO DE DURAÇÕES (em minutos) — Obtido da Versão de Elite Centralizada
const SERVICE_DURATIONS: Record<string, number> = Object.fromEntries(
  Object.entries(SERVICES_CONFIG).map(([k, v]) => [k, v.duration])
);

// 🔒 Função utilitária: Garante que existe um Client de sistema para bloqueios admin
const getOrCreateAdminClient = async (): Promise<string> => {
  const ADMIN_EMAIL = 'system@studiobraz.internal';
  let adminClient = await prisma.client.findUnique({ where: { email: ADMIN_EMAIL } });

  if (!adminClient) {
    adminClient = await prisma.client.create({
      data: {
        name: 'SISTEMA ADMIN',
        email: ADMIN_EMAIL,
        phone: null,
      }
    });
    logger.info(`Cliente de sistema criado com ID: ${adminClient.id} `);
  }

  return adminClient.id;
};

/**
 * 1. CRIAR AGENDAMENTO
 * Resolve conflitos de identidade transferindo históricos e apagando duplicados.
 */
export const createBooking = async (req: Request, res: Response) => {
  const result = createBookingSchema.safeParse(req);
  if (!result.success) {
    return res.status(400).json({ message: 'Dados de marcação inválidos.', errors: result.error.format() });
  }
  const { name, email, phone, service, date, time } = result.data.body;

  try {
    // 1. Higiene de Dados (Sanitização)
    const cleanEmail = email && email.trim() !== "" ? email.trim().toLowerCase() : null;
    const cleanPhone = phone && phone.trim() !== "" ? phone.replace(/\D/g, '') : null;
    const formattedName = name.trim();

    // 2. Pesquisa Detalhada (Busca Multidimencional)
    const clientByEmail = cleanEmail ? await prisma.client.findUnique({ where: { email: cleanEmail } }) : null;
    const clientByPhone = cleanPhone ? await prisma.client.findFirst({ where: { phone: cleanPhone } }) : null;

    let masterClient;

    // 🚀 3. LÓGICA DE FUSÃO DE ELITE (TRANSACIONAL)
    if (clientByEmail && clientByPhone && clientByEmail.id !== clientByPhone.id) {
      console.log("⚠️ [FUSÃO] Detetada identidade dividida. Unificando perfis via Transação...");

      masterClient = await prisma.$transaction(async (tx) => {
        const slaveClient = clientByPhone!;
        const leadClient = clientByEmail!;

        // A) Movemos todos os agendamentos do 'Slave' para o 'Master'
        await tx.booking.updateMany({
          where: { clientId: slaveClient.id },
          data: { clientId: leadClient.id }
        });

        // B) Transferimos os Pontos de Fidelidade
        const combinedPoints = leadClient.points + slaveClient.points;

        // C) Atualizamos o Master com o telefone, nome novo e pontos combinados
        const updatedMaster = await tx.client.update({
          where: { id: leadClient.id },
          data: {
            phone: cleanPhone,
            name: formattedName,
            points: combinedPoints
          }
        });

        // D) Apagamos o registo duplicado (Slave)
        await tx.client.delete({ where: { id: slaveClient.id } });

        return updatedMaster;
      });

      console.log(`✅[FUSÃO] Perfil unificado com sucesso no ID: ${masterClient.id} `);
    }
    else if (clientByEmail) {
      // Já existe por email? Atualiza dados.
      masterClient = await prisma.client.update({
        where: { id: clientByEmail.id },
        data: { phone: cleanPhone || clientByEmail.phone, name: formattedName }
      });
    }
    else if (clientByPhone) {
      // Já existe por telefone? Atualiza dados (e adiciona email se houver).
      masterClient = await prisma.client.update({
        where: { id: clientByPhone.id },
        data: { email: cleanEmail || clientByPhone.email, name: formattedName }
      });
    }
    else {
      // Ninguém encontrado? Cria do zero.
      masterClient = await prisma.client.create({
        data: { name: formattedName, email: cleanEmail, phone: cleanPhone }
      });
    }

    // 📅 4. Verificar conflito REAL e reutilizar slot cancelado/eliminado
    const existingBooking = await prisma.booking.findUnique({
      where: { date_time: { date, time } }
    });

    let booking;

    if (existingBooking) {
      // Se o slot tem um booking ATIVO (não cancelado, não eliminado) → bloquear
      const isActive = ['pending', 'confirmed', 'blocked'].includes(existingBooking.status) && !existingBooking.deletedAt;
      if (isActive) {
        return res.status(409).json({ message: 'Este horário já está reservado. Por favor escolha outro.' });
      }

      // Se o slot tem um booking CANCELADO/ELIMINADO → reutilizar o registo
      booking = await prisma.booking.update({
        where: { id: existingBooking.id },
        data: {
          service,
          status: 'pending',
          clientId: masterClient.id,
          deletedAt: null,        // Reativar se estava soft-deleted
          notes: null,
          extraServices: null,
          totalPrice: null,
        },
        include: { client: true }
      });
    } else {
      // Slot completamente livre → criar novo
      booking = await prisma.booking.create({
        data: {
          service,
          date,
          time,
          clientId: masterClient.id
        },
        include: { client: true }
      });
    }
    // 📧 5. Envio de Email ao CLIENTE (ASSÍNCRONO)
    if (masterClient.email) {
      sendLuxuryEmail(
        masterClient.email,
        'Agendamento Recebido • Studio Braz',
        masterClient.name,
        service,
        date,
        time
      ).catch((e: any) => console.error("⚠️ Falha silenciosa no envio de email ao cliente:", e));
    }

    // 📧 6. Notificação ao ADMIN (ASSÍNCRONO)
    const adminEmail = process.env.SMTP_USER;
    if (adminEmail) {
      sendLuxuryEmail(
        adminEmail,
        `🔔 Nova Reserva • ${masterClient.name} • ${service}`,
        'Diretor',
        `Nova reserva de ${masterClient.name}: ${service}`,
        date,
        time
      ).catch((e: any) => console.error("⚠️ Falha ao notificar admin:", e));
    }

    return res.status(201).json(booking);

  } catch (error: any) {
    console.error("❌ ERRO NO SERVIDOR:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({ message: "Conflito de horários. Este slot já foi conquistado." });
    }

    return res.status(500).json({ message: "Erro interno ao processar identidade." });
  }
};

/**
 * 2. VERIFICAR HORÁRIOS OCUPADOS (A Trituradora Inteligente)
 */
export const getBusySlots = async (req: Request, res: Response) => {
  const { date } = req.query;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        date: String(date),
        status: { in: ['pending', 'confirmed', 'blocked'] },
        deletedAt: null,  // Excluir bookings soft-deleted
      }
    });

    const occupiedSlots = new Set<string>();

    bookings.forEach((b: any) => {
      const duration = SERVICE_DURATIONS[b.service] || 30;
      const [startH, startM] = b.time.split(':').map(Number);
      let currentMinutes = startH * 60 + startM;
      const endMinutes = currentMinutes + duration;

      while (currentMinutes < endMinutes) {
        const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
        const m = (currentMinutes % 60).toString().padStart(2, '0');
        occupiedSlots.add(`${h}:${m}`);
        currentMinutes += 30;
      }
    });

    res.json(Array.from(occupiedSlots));
  } catch (error: any) {
    logger.error(`Erro no servidor: ${error.message} `);
    res.status(500).json([]);
  }
};

/**
 * 3. BLOQUEIO MANUAL (Poder do Diretor)
 * Suporta: dia único, intervalo de datas, dia inteiro, intervalo de horas
 */
export const blockSchedule = async (req: Request, res: Response) => {
  const blockSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    time: z.string().max(5).optional().nullable(),
    timeStart: z.string().max(5).optional().nullable(),
    timeEnd: z.string().max(5).optional().nullable(),
    reason: z.string().max(255, 'Motivo demasiado longo').optional(),
    fullDay: z.boolean().optional(),
  });

  const result = blockSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Dados de bloqueio inválidos.', errors: result.error.format() });
  }

  const { date, dateEnd, time, timeStart, timeEnd, reason, fullDay } = result.data;

  try {
    const adminClientId = await getOrCreateAdminClient();

    // 1. Calcular todas as datas a bloquear
    const datesToBlock: string[] = [];
    const startDate = new Date(`${date} T12:00:00Z`);
    const endDate = dateEnd ? new Date(`${dateEnd} T12:00:00Z`) : startDate;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      datesToBlock.push(dateStr);
    }

    // 2. Calcular os slots de hora a bloquear
    const ALL_SLOTS = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
      "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
    ];

    let timesToBlock: string[];

    if (fullDay) {
      timesToBlock = ALL_SLOTS;
    } else if (timeStart && timeEnd) {
      const startIdx = ALL_SLOTS.indexOf(timeStart);
      const endIdx = ALL_SLOTS.indexOf(timeEnd);
      if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
        return res.status(400).json({ message: 'Intervalo de horas inválido.' });
      }
      timesToBlock = ALL_SLOTS.slice(startIdx, endIdx + 1);
    } else if (time) {
      timesToBlock = [time];
    } else {
      return res.status(400).json({ message: 'Especifique dia inteiro, hora, ou intervalo de horas.' });
    }

    // 3. Processar cada data
    let totalBlocked = 0;
    let totalClientsNotified = 0;

    for (const dateStr of datesToBlock) {
      const affectedBookings = await prisma.booking.findMany({
        where: {
          date: dateStr,
          time: { in: timesToBlock },
          status: { notIn: ['blocked', 'cancelled', 'deleted'] }
        },
        include: { client: true }
      });

      for (const booking of affectedBookings) {
        if (booking.client && booking.clientId !== adminClientId) {
          const msg = `Lamentamos informar, mas tivemos de cancelar o seu horário de ${booking.service} no dia ${booking.date} às ${booking.time}.Motivo: ${reason || 'Imprevisto no estúdio'}.`;

          if (booking.client.phone) {
            await sendNotification(booking.client.phone, booking.client.name, msg, 'sms');
          }

          if (booking.client.email) {
            sendLuxuryEmail(
              booking.client.email,
              'Aviso de Cancelamento • Studio Braz',
              booking.client.name,
              `Cancelado: ${booking.service} `,
              booking.date,
              booking.time
            ).catch((e: any) => console.error("⚠️ Erro ao enviar email de cancelamento:", e));
          }
          totalClientsNotified++;
        }
      }

      for (const t of timesToBlock) {
        await prisma.booking.upsert({
          where: { date_time: { date: dateStr, time: t } },
          update: { status: 'blocked', service: 'BLOQUEIO_ADMIN' },
          create: {
            date: dateStr,
            time: t,
            service: 'BLOQUEIO_ADMIN',
            status: 'blocked',
            clientId: adminClientId,
          }
        });
        totalBlocked++;
      }
    }

    res.json({
      message: `${totalBlocked} slots bloqueados em ${datesToBlock.length} dia(s).${totalClientsNotified} clientes notificados.`,
      totalBlocked,
      totalDays: datesToBlock.length,
      totalClientsNotified
    });
  } catch (error: any) {
    logger.error(`Erro ao trancar horários: ${error.message} `);
    res.status(500).json({ message: 'Erro ao bloquear horário.' });
  }
};

/**
 * 3B. DESBLOQUEIO EM MASSA (Undo Inteligente)
 */
export const batchDeleteBlocks = async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Nenhum ID fornecido.' });
  }

  try {
    const deleted = await prisma.booking.deleteMany({
      where: {
        id: { in: ids },
        status: 'blocked'
      }
    });

    res.json({ message: `${deleted.count} bloqueio(s) removido(s) com sucesso.`, count: deleted.count });
  } catch (error: any) {
    logger.error(`Erro no batch delete: ${error.message} `);
    res.status(500).json({ message: 'Erro ao remover bloqueios.' });
  }
};

/**
 * 4. LISTAR TUDO (Dashboard)
 */
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const whereClause: any = { deletedAt: null };

    // Só filtra por data se as datas forem fornecidas (retrocompatível)
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: { client: true },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
      take: 500, // Safety limit — previne respostas com milhares de registos
    });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao carregar a agenda.' });
  }
};

import { updateBookingStatusSchema } from '../schemas/bookingStatusSchema.js';

/**
 * 5. ATUALIZAR STATUS & FIDELIZAÇÃO
 */
export const updateBookingStatus = async (req: Request, res: Response) => {
  const result = updateBookingStatusSchema.safeParse(req);
  if (!result.success) {
    return res.status(400).json({ message: 'Status inválido.', errors: result.error.format() });
  }
  const { id } = req.params;
  const { status } = result.data.body;

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { client: true }
    });

    if (status === 'confirmed') {
      await prisma.client.update({
        where: { id: booking.clientId },
        data: { points: { increment: 1 } }
      });

      if (booking.client.email) {
        // Envio assíncrono para os emails de aceitação
        sendLuxuryEmail(
          booking.client.email,
          'MARCAÇÃO APROVADA • Studio Braz',
          booking.client.name,
          booking.service,
          booking.date,
          booking.time
        ).catch((e: any) => console.error("⚠️ Falha ao notificar cliente da aprovação:", e));
      }
    } else if (status === 'cancelled' || status === 'rejected') {
      if (booking.client.email) {
        sendLuxuryEmail(
          booking.client.email,
          'MARCAÇÃO NÃO APROVADA • Studio Braz',
          booking.client.name,
          booking.service,
          booking.date,
          booking.time
        ).catch((e: any) => console.error("⚠️ Falha ao notificar cliente da rejeição:", e));
      }
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao processar status.' });
  }
};

/**
 * 6. TOP 5 CLIENTES
 */
export const getTopClients = async (req: Request, res: Response) => {
  try {
    const top = await prisma.client.findMany({
      take: 5,
      orderBy: { points: 'desc' },
      select: { name: true, points: true, tier: true }
    });
    res.json(top);
  } catch (error) {
    res.status(500).json([]);
  }
};

/**
 * 7. ELIMINAÇÃO DEFINITIVA
 */
export const deleteBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Soft delete — marca como eliminado mas mantém na BD
    await prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao remover.' });
  }
};

/**
 * 7B. RESTAURAR BOOKING (Undo)
 */
export const restoreBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.booking.update({
      where: { id },
      data: { deletedAt: null }
    });
    res.json({ message: 'Booking restaurado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao restaurar.' });
  }
};

/**
 * 8. EDITAR BOOKING (Mudar serviço, data, hora)
 */
export const updateBooking = async (req: Request, res: Response) => {
  const editSchema = z.object({
    service: z.string().max(100).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    time: z.string().max(5).optional(),
    notes: z.string().max(1000, 'Notas demasiado longas').optional(),
    status: z.string().optional(),
    extraServices: z.array(z.string()).optional(),
    totalPrice: z.number().optional(),
  });

  const result = editSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Dados de edição inválidos.' });
  }

  const { id } = req.params;
  const { service, date, time, notes, status, extraServices, totalPrice } = result.data;

  try {
    // Verificar conflitos de horário
    if (date && time) {
      const conflict = await prisma.booking.findFirst({
        where: {
          date,
          time,
          id: { not: id },
          status: { not: 'cancelled' },
          deletedAt: null
        }
      });

      if (conflict) {
        return res.status(409).json({ message: 'Conflito: Já existe um agendamento para este horário.' });
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(service && { service }),
        ...(date && { date }),
        ...(time && { time }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
        ...(extraServices !== undefined && { extraServices: JSON.stringify(extraServices) }),
        ...(totalPrice !== undefined && { totalPrice }),
      },
      include: { client: true }
    });

    logger.info(`Booking ${id} editado: ${service || 'mesmo'} em ${date || 'mesma data'} às ${time || 'mesma hora'} `);
    res.json(updated);
  } catch (error: any) {
    logger.error(`Erro ao editar booking: ${error.message} `);
    res.status(500).json({ message: 'Erro ao editar agendamento.' });
  }
};

/**
 * 9. LISTAR TODOS OS CLIENTES (Gestão VIP)
 */
export const getAllClients = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50; // Limite padrão de segurança
    const skip = (page - 1) * limit;

    const clients = await prisma.client.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ]
      } : {},
      include: {
        _count: { select: { bookings: true } }
      },
      orderBy: { points: 'desc' },
      take: limit,
      skip: skip,
    });

    res.json(clients);
  } catch (error: any) {
    logger.error(`Erro ao listar clientes: ${error.message} `);
    res.status(500).json({ message: 'Erro ao carregar clientes.' });
  }
};

/**
 * 10. ATUALIZAR CLIENTE (Tier, Pontos, Dados)
 */
export const updateClient = async (req: Request, res: Response) => {
  const clientUpdateSchema = z.object({
    name: z.string().max(100).optional(),
    email: z.string().email().max(100).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    tier: z.string().max(20).optional(),
    points: z.number().optional(),
    notes: z.string().max(1000).optional().nullable(),
  });

  const result = clientUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Dados de cliente inválidos.', errors: result.error.format() });
  }

  const { id } = req.params;
  const { name, email, phone, tier, points, notes } = result.data;

  try {
    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(tier && { tier }),
        ...(points !== undefined && { points }),
        ...(notes !== undefined && { notes }),
      }
    });

    logger.info(`Cliente ${id} atualizado: ${name || updated.name} `);
    res.json(updated);
  } catch (error: any) {
    logger.error(`Erro ao atualizar cliente: ${error.message} `);
    res.status(500).json({ message: 'Erro ao atualizar cliente.' });
  }
};

/**
 * 11. VER PERFIL DO CLIENTE (com bookings)
 */
export const getClientProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { date: 'desc' },
          take: 20,
        },
        _count: { select: { bookings: true } }
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }

    res.json(client);
  } catch (error: any) {
    logger.error(`Erro ao obter perfil: ${error.message} `);
    res.status(500).json({ message: 'Erro ao carregar perfil.' });
  }
};