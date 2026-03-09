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
 * Suporta múltiplos serviços e atribuição de staff.
 */
export const createBooking = async (req: Request, res: Response) => {
  const bodySchema = z.object({
    name: z.string().min(3),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    serviceIds: z.array(z.string()).min(1).optional(),
    staffId: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    // Suporte para múltiplos segmentos (interligados)
    segments: z.array(z.object({
      staffId: z.string(),
      serviceIds: z.array(z.string()).min(1)
    })).optional()
  });

  const result = bodySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ message: 'Dados inválidos.', errors: result.error.format() });

  const { name, email, phone, date, time, segments, staffId, serviceIds } = result.data;

  try {
    const cleanEmail = email?.trim().toLowerCase() || null;
    const cleanPhone = phone?.replace(/\D/g, '') || null;

    let client = await prisma.client.findFirst({
      where: { OR: [ ...(cleanEmail ? [{ email: cleanEmail }] : []), ...(cleanPhone ? [{ phone: cleanPhone }] : []) ] }
    });
    if (!client) client = await prisma.client.create({ data: { name, email: cleanEmail, phone: cleanPhone } });

    // Lógica Sequencial (Point #8 do Plano)
    if (segments && segments.length > 0) {
      let firstBookingId: string | null = null;
      const createdBookings = [];

      for (const segment of segments) {
        const services = await (prisma as any).service.findMany({ where: { id: { in: segment.serviceIds } } });
        const totalPrice = services.reduce((acc: number, s: any) => acc + s.price, 0);

        const b: any = await (prisma.booking as any).create({
          data: {
            date,
            time, // TODO: No futuro, calcular offset de tempo real para cada segmento
            staffId: segment.staffId,
            clientId: client.id,
            totalPrice,
            parentBookingId: firstBookingId,
            services: { create: segment.serviceIds.map(id => ({ serviceId: id })) }
          }
        });
        if (!firstBookingId) firstBookingId = b.id;
        createdBookings.push(b);
      }
      return res.status(201).json(createdBookings);
    }

    // Fallback para agendamento simples
    // 2. Obter serviços para info de duração/preço
    if (staffId && serviceIds) {
      const services = await (prisma as any).service.findMany({ where: { id: { in: serviceIds } } });
      const totalPrice = services.reduce((acc: number, s: any) => acc + s.price, 0);
      const booking = await (prisma.booking as any).create({
        data: {
          date, time, staffId, clientId: client.id, totalPrice,
          services: { create: serviceIds.map(id => ({ serviceId: id })) }
        },
        include: { client: true, staff: true, services: { include: { service: true } } }
      });
      return res.status(201).json(booking);
    }

    return res.status(400).json({ message: 'Especifique staff/serviços ou segmentos.' });
  } catch (error: any) {
    logger.error("❌ Erro no Agendamento Sequencial:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
};

/**
 * 2. VERIFICAR HORÁRIOS OCUPADOS (A Trituradora Inteligente)
 * Agora filtrada por Staff e com lógica VIP para fins de semana.
 */
export const getBusySlots = async (req: Request, res: Response) => {
  const { date, staffId, clientId } = req.query as { date: string, staffId: string, clientId?: string };

  if (!date || !staffId) {
    return res.status(400).json({ message: 'Data e Profissional são obrigatórios.' });
  }

  try {
    // 1. Lógica de Bloqueio por Calendário (Fins de Semana e Feriados)
    const dayOfWeek = new Date(date).getUTCDay(); // 0 = Domingo, 6 = Sábado
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Lista simples de feriados (Exemplo)
    const holidays = ['2026-01-01', '2026-04-25', '2026-05-01', '2026-06-10', '2026-08-15', '2026-10-05', '2026-11-01', '2026-12-01', '2026-12-08', '2026-12-25'];
    const isHoliday = holidays.includes(date);

    if (isWeekend || isHoliday) {
      let canBook = false;

      // Regra de Ouro: Mariana + VIP = Desbloqueia
      if (clientId) {
        const client: any = await prisma.client.findUnique({ where: { id: clientId } });
        const staff: any = await prisma.user.findUnique({ where: { id: staffId } });
        
        if (client?.isVIP && (staff?.role === 'SUPER_ADMIN' || staff?.email === 'mariana@studiobraz.com')) {
          canBook = true;
        }
      }

      if (!canBook) {
        // Se não pode marcar, retornamos todos os slots como ocupados (bloqueio total)
        return res.json(["ALL_DAY_LOCKED"]); 
      }
    }

    // 2. Buscar agendamentos existentes para este staff
    const bookings = await (prisma.booking as any).findMany({
      where: {
        date,
        staffId,
        status: { in: ['pending', 'confirmed', 'paid', 'completed', 'blocked'] },
        deletedAt: null,
      },
      include: {
        services: {
          include: { service: true }
        }
      }
    });

    const occupiedSlots = new Set<string>();

    bookings.forEach((b: any) => {
      // Somar duração de todos os serviços do agendamento
      const duration = b.services.reduce((acc: number, s: any) => acc + s.service.duration, 0);
      const [startH, startM] = b.time.split(':').map(Number);
      let currentMinutes = startH * 60 + startM;
      const endMinutes = currentMinutes + duration;

      while (currentMinutes < endMinutes) {
        const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
        const m = (currentMinutes % 60).toString().padStart(2, '0');
        occupiedSlots.add(`${h}:${m}`);
        currentMinutes += 30; // Slots de 30 min por padrão
      }
    });

    res.json(Array.from(occupiedSlots));
  } catch (error: any) {
    logger.error(`Erro ao buscar slots ocupados:`, error);
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
    const startDate = new Date(`${date}T12:00:00Z`);
    const endDate = dateEnd ? new Date(`${dateEnd}T12:00:00Z`) : startDate;

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
        const existing = await prisma.booking.findFirst({
          where: { date: dateStr, time: t }
        });

        if (existing) {
          if (existing.status !== 'blocked') {
            // Cancel the existing appointment
            await prisma.booking.update({
              where: { id: existing.id },
              data: { status: 'cancelled' }
            });

            // And create a new blocked slot so the schedule is completely closed
            await prisma.booking.create({
              data: {
                date: dateStr,
                time: t,
                service: 'BLOQUEIO_ADMIN',
                status: 'blocked',
                client: { connect: { id: adminClientId } }
              }
            });
          }
        } else {
          await prisma.booking.create({
            data: {
              date: dateStr,
              time: t,
              service: 'BLOQUEIO_ADMIN',
              status: 'blocked',
              clientId: adminClientId,
            }
          });
        }
        totalBlocked++;
      }
    }

    res.json({
      message: `${totalBlocked} slots bloqueados em ${datesToBlock.length} dia(s). ${totalClientsNotified} clientes notificados.`,
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
      include: { 
        client: true,
        staff: {
          select: { id: true, displayName: true, photoUrl: true, role: true }
        },
        services: {
          include: { service: true }
        }
      },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
      take: 2000, 
    });
    res.json(bookings);
  } catch (error: any) {
    logger.error("❌ Erro ao carregar a agenda:", {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
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
  const { status, totalPrice } = result.data.body;

  try {
    const dataToUpdate: any = { status };
    if (totalPrice !== undefined) dataToUpdate.totalPrice = totalPrice;

    const booking = await prisma.booking.update({
      where: { id },
      data: dataToUpdate,
      include: { client: true }
    });

    if (status === 'confirmed') {
      if (booking.client.email) {
        sendLuxuryEmail(
          booking.client.email,
          'MARCAÇÃO APROVADA • Studio Braz',
          booking.client.name,
          'Serviço Confirmado',
          booking.date,
          booking.time
        ).catch((e: any) => console.error("⚠️ Falha ao notificar cliente da aprovação:", e));
      }
    } else if (status === 'paid') {
      // 🚀 GATILHO DE FATURAÇÃO CERTIFICADA
      import('../services/billingService.js').then(({ generateInvoice }) => {
        generateInvoice(booking.id).catch(e => console.error("❌ Falha na Faturação Automática:", e));
      });
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
      orderBy: { bookings: { _count: 'desc' } },
      select: { name: true, _count: { select: { bookings: true } } }
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
    totalPrice: z.number().optional(),
  });

  const result = editSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Dados de edição inválidos.' });
  }

  const { id } = req.params;
  const { service, date, time, notes, status, totalPrice } = result.data;

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
      orderBy: { name: 'asc' },
      take: limit,
      skip: skip,
    });

    res.json(clients);
  } catch (error: any) {
    logger.error(`Erro ao listar clientes:`, {
      message: error.message,
      stack: error.stack
    });
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
  });

  const result = clientUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Dados de cliente inválidos.', errors: result.error.format() });
  }

  const { id } = req.params;
  const { name, email, phone } = result.data;

  try {
    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
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

/**
 * 12. LIMPEZA PROFUNDA DA BASE DE DADOS (JANITOR)
 * Hard Delete de lixo obsoleto para acelerar Queries, enquanto preservamos Financeiro.
 */
export const deepCleanDatabase = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Data de há 60 dias (para pendentes esquecidos e clientes inativos)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    const date60Lim = sixtyDaysAgo.toISOString().split('T')[0];

    const halfYearAgo = new Date();
    halfYearAgo.setDate(today.getDate() - 180);
    const date180Lim = halfYearAgo.toISOString().split('T')[0];

    // 1. Apagar bloqueios físicos cujo dia já passou
    const delBlocked = await prisma.booking.deleteMany({
      where: {
        status: 'blocked',
        date: { lt: todayStr }
      }
    });

    // 2. Apagar pendentes muito velhos (> 2 meses)
    const delPending = await prisma.booking.deleteMany({
      where: {
        status: 'pending',
        date: { lt: date60Lim }
      }
    });

    // 3. Apagar cancelados/rejeitados sem utilidade rápida
    const delCancelled = await prisma.booking.deleteMany({
      where: {
        status: { in: ['cancelled', 'rejected'] },
        date: { lt: date180Lim }
      }
    });

    // 4. Apagar lixo da Lixeira (Soft Deleted) com mais de 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const delSoft = await prisma.booking.deleteMany({
      where: { deletedAt: { lt: thirtyDaysAgo } }
    });

    // 5. Apagar Clientes Fantasmas: Zero agendamentos válidos e inativos há 60 dias
    // Primeiro encontramos clientes suspeitos...
    const ghostClients = await prisma.client.findMany({
      where: {
        bookings: { none: {} }, // Sem bookings agora (podes ter apagado todos os antigos no passo acima)
        createdAt: { lt: sixtyDaysAgo } // E que já foram criados há mais de 60 dias
      }
    });

    let delClientsCount = 0;
    if (ghostClients.length > 0) {
       // Não apagar o cliente de admin
       const toDelete = ghostClients.filter((c: any) => c.email !== 'system@studiobraz.internal').map((c: any) => c.id);
       if (toDelete.length > 0) {
         const delClients = await prisma.client.deleteMany({
           where: { id: { in: toDelete } }
         });
         delClientsCount = delClients.count;
       }
    }

    // 6. Limpar TokenBlacklist de logins passados que já caducaram o tempo de expiração
    const delTokens = await prisma.tokenBlacklist.deleteMany({
      where: { expiresAt: { lt: today } }
    });

    const totalPurged = delBlocked.count + delPending.count + delCancelled.count + delSoft.count + delClientsCount + delTokens.count;

    logger.info(`🧹 Limpeza Profunda executada. Registos mortos purgatos: ${totalPurged}`);
    
    res.json({
      message: 'Limpeza do Sistema concluída com sucesso.',
      stats: {
        blockedPurged: delBlocked.count,
        pendingPurged: delPending.count,
        cancelledPurged: delCancelled.count,
        softDeletesPurged: delSoft.count,
        clientsPurged: delClientsCount,
        expiredTokensPurged: delTokens.count,
        totalMemorySaved: totalPurged
      }
    });
  } catch (error: any) {
    logger.error(`❌ Erro crítico na Limpeza Profunda:`, { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erro ao executar a limpeza profunda.' });
  }
};

// --- 13. EXPORTAR CLIENTES (CSV) ---
export const exportClientsCSV = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      include: { _count: { select: { bookings: true } } }
    });

    let csv = 'Nome,Email,Telefone,Total de Reservas,VIP\n';
    clients.forEach((c: any) => {
      csv += `"${c.name}","${c.email || ''}","${c.phone || ''}",${c._count.bookings},${c.isVIP ? 'SIM' : 'NÃO'}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('clientes.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao exportar CSV.' });
  }
};

/**
 * 14. LISTAR STAFF E SEUS SERVIÇOS (Gatilho de Agendamento)
 */
export const getStaffWithServices = async (req: Request, res: Response) => {
  try {
    const staff = await (prisma.user as any).findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN_STAFF'] }
      },
      select: {
        id: true,
        email: true,
        role: true,
        providedServices: true
      }
    });

    res.json(staff);
  } catch (error: any) {
    logger.error("❌ Erro ao obter lista de staff para agendamento:", error);
    res.status(500).json({ message: "Erro ao carregar equipa." });
  }
};