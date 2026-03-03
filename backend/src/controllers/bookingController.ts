// backend/src/controllers/bookingController.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
import { sendNotification } from '../services/notificationService.js';
import { sendLuxuryEmail } from '../services/emailService.js';

// 🛠️ DICIONÁRIO DE DURAÇÕES (em minutos) — Alinhado com o Frontend
const SERVICE_DURATIONS: Record<string, number> = {
  'Microblading': 150,    // 2h30
  'Limpeza de Pele': 90,  // 1h30
  'Unhas de Gel': 90,     // 1h30
  'Verniz Gel': 45,       // 45min
  'Massagem': 60,         // 1h
  'Depilacao': 30,        // 30min
  'BLOQUEIO_ADMIN': 60    // Padrão para bloqueios do diretor
};

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
    logger.info(`Cliente de sistema criado com ID: ${adminClient.id}`);
  }

  return adminClient.id;
};

/**
 * 1. CRIAR AGENDAMENTO
 * Resolve conflitos de identidade transferindo históricos e apagando duplicados.
 */
export const createBooking = async (req: Request, res: Response) => {
  const { name, email, phone, service, date, time } = req.body;

  try {
    // 1. Higiene de Dados (Sanitização)
    const cleanEmail = email && email.trim() !== "" ? email.trim().toLowerCase() : null;
    const cleanPhone = phone && phone.trim() !== "" ? phone.replace(/\D/g, '') : null;
    const formattedName = name.trim();

    // 2. Pesquisa Detalhada (Busca Multidimencional)
    const clientByEmail = cleanEmail ? await prisma.client.findUnique({ where: { email: cleanEmail } }) : null;
    const clientByPhone = cleanPhone ? await prisma.client.findFirst({ where: { phone: cleanPhone } }) : null;

    let masterClient;

    // 🚀 3. LÓGICA DE FUSÃO DE ELITE
    if (clientByEmail && clientByPhone && clientByEmail.id !== clientByPhone.id) {
      console.log("⚠️ [FUSÃO] Detetada identidade dividida. Unificando perfis...");

      // O Cliente do Email será o "Master". O do Telefone será o "Slave".
      masterClient = clientByEmail;
      const slaveClient = clientByPhone;

      // A) Movemos todos os agendamentos do 'Slave' para o 'Master'
      await prisma.booking.updateMany({
        where: { clientId: slaveClient.id },
        data: { clientId: masterClient.id }
      });

      // B) Transferimos os Pontos de Fidelidade! (Pequeno bónus de lógica)
      const combinedPoints = masterClient.points + slaveClient.points;

      // C) Atualizamos o Master com o telefone, nome novo e pontos combinados
      masterClient = await prisma.client.update({
        where: { id: masterClient.id },
        data: {
          phone: cleanPhone,
          name: formattedName,
          points: combinedPoints
        }
      });

      // D) Apagamos o registo duplicado (Slave)
      await prisma.client.delete({ where: { id: slaveClient.id } });

      console.log(`✅ [FUSÃO] Perfil ${slaveClient.id} fundido com sucesso no ${masterClient.id}`);
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

    // 📅 4. Criar o agendamento para o Utilizador Unificado
    const booking = await prisma.booking.create({
      data: {
        date: String(date),
        time,
        service,
        clientId: masterClient.id
      },
      include: { client: true }
    });

    // 📧 5. Envio de Email Seguro (ASSÍNCRONO - Fire and Forget)
    if (masterClient.email) {
      // Não usamos await aqui para não bloquear a resposta ao Frontend caso o SMTP esteja lento
      sendLuxuryEmail(
        masterClient.email,
        'Agendamento Recebido • Studio Braz',
        masterClient.name,
        service,
        date,
        time
      ).catch((e: any) => console.error("⚠️ Falha silenciosa no envio de email ao cliente:", e));
    }

    return res.status(201).json(booking);

  } catch (error: any) {
    console.error("❌ ERRO NO SERVIDOR:", error);

    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Conflito de horários. Este slot já foi conquistado." });
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
        status: { in: ['pending', 'confirmed', 'blocked'] }
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
    logger.error(`Erro no servidor: ${error.message}`);
    res.status(500).json([]);
  }
};

/**
 * 3. BLOQUEIO MANUAL (Poder do Diretor)
 * Suporta: dia único, intervalo de datas, dia inteiro, intervalo de horas
 */
export const blockSchedule = async (req: Request, res: Response) => {
  const { date, dateEnd, time, timeStart, timeEnd, reason, fullDay } = req.body;

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
          const msg = `Lamentamos informar, mas tivemos de cancelar o seu horário de ${booking.service} no dia ${booking.date} às ${booking.time}. Motivo: ${reason || 'Imprevisto no estúdio'}.`;

          if (booking.client.phone) {
            await sendNotification(booking.client.phone, booking.client.name, msg, 'sms');
          }

          if (booking.client.email) {
            sendLuxuryEmail(
              booking.client.email,
              'Aviso de Cancelamento • Studio Braz',
              booking.client.name,
              `Cancelado: ${booking.service}`,
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
      message: `${totalBlocked} slots bloqueados em ${datesToBlock.length} dia(s). ${totalClientsNotified} clientes notificados.`,
      totalBlocked,
      totalDays: datesToBlock.length,
      totalClientsNotified
    });
  } catch (error: any) {
    logger.error(`Erro ao trancar horários: ${error.message}`);
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
    logger.error(`Erro no batch delete: ${error.message}`);
    res.status(500).json({ message: 'Erro ao remover bloqueios.' });
  }
};

/**
 * 4. LISTAR TUDO (Dashboard)
 */
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { client: true },
      orderBy: [{ date: 'desc' }, { time: 'desc' }]
    });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao carregar a agenda.' });
  }
};

/**
 * 5. ATUALIZAR STATUS & FIDELIZAÇÃO
 */
export const updateBookingStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { client: true }
    });

    if (status === 'confirmed') {
      await prisma.client.update({
        where: { id: booking.clientId },
        data: { points: { increment: 10 } }
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
    await prisma.booking.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao remover.' });
  }
};

/**
 * 8. EDITAR BOOKING (Mudar serviço, data, hora)
 */
export const updateBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { service, date, time } = req.body;

  try {
    // Verificar conflitos de horário
    if (date && time) {
      const conflict = await prisma.booking.findFirst({
        where: {
          date,
          time,
          id: { not: id },
          status: { not: 'cancelled' }
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
      },
      include: { client: true }
    });

    logger.info(`Booking ${id} editado: ${service || 'mesmo'} em ${date || 'mesma data'} às ${time || 'mesma hora'}`);
    res.json(updated);
  } catch (error: any) {
    logger.error(`Erro ao editar booking: ${error.message}`);
    res.status(500).json({ message: 'Erro ao editar agendamento.' });
  }
};

/**
 * 9. LISTAR TODOS OS CLIENTES (Gestão VIP)
 */
export const getAllClients = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';

    const clients = await prisma.client.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      } : {},
      include: {
        _count: { select: { bookings: true } }
      },
      orderBy: { points: 'desc' },
    });

    res.json(clients);
  } catch (error: any) {
    logger.error(`Erro ao listar clientes: ${error.message}`);
    res.status(500).json({ message: 'Erro ao carregar clientes.' });
  }
};

/**
 * 10. ATUALIZAR CLIENTE (Tier, Pontos, Dados)
 */
export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, tier, points } = req.body;

  try {
    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(tier && { tier }),
        ...(points !== undefined && { points }),
      }
    });

    logger.info(`Cliente ${id} atualizado: ${name || updated.name}`);
    res.json(updated);
  } catch (error: any) {
    logger.error(`Erro ao atualizar cliente: ${error.message}`);
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
    logger.error(`Erro ao obter perfil: ${error.message}`);
    res.status(500).json({ message: 'Erro ao carregar perfil.' });
  }
};