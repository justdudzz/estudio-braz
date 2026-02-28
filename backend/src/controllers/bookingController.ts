import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../utils/logger';
import { sendNotification } from '../services/notificationService';
import { sendLuxuryEmail } from '../services/emailService'; // <-- O SEU NOVO ESTAFETA

/**
 * 1. CRIAR AGENDAMENTO (Lado do Cliente)
 * Cria a reserva e envia o Email Automático de "Pedido Recebido".
 */
export const createBooking = async (req: Request, res: Response) => {
  const { name, email, phone, service, date, time } = req.body;

  try {
    const booking = await prisma.booking.create({
      data: {
        date: String(date),
        time,
        service,
        client: {
          connectOrCreate: {
            where: { email },
            create: { name, email, phone }
          }
        }
      },
      include: { client: true }
    });

    logger.info(`Agendamento realizado: ${service} para ${name} em ${date}`);
    
    // 🚀 GATILHO DE EMAIL: Dispara assim que a cliente clica no site
    await sendLuxuryEmail(
      email, 
      'Pedido de Agendamento • Studio Braz', 
      name, 
      service, 
      date, 
      time
    );

    res.status(201).json(booking);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Este horário já foi conquistado por outra cliente.' });
    }
    logger.error(`Erro ao criar agendamento SQL: ${error.message}`);
    res.status(500).json({ message: 'Erro ao processar o agendamento na fortaleza.' });
  }
};

/**
 * 2. VERIFICAR HORÁRIOS OCUPADOS (A Trituradora de Horários)
 */
export const getBusySlots = async (req: Request, res: Response) => {
  const { date } = req.query;

  try {
    const busy = await prisma.booking.findMany({
      where: {
        date: String(date),
        status: { in: ['pending', 'confirmed', 'blocked'] }
      },
      select: { time: true }
    });

    const occupiedTimes = busy.map(b => b.time);
    res.json(occupiedTimes);
  } catch (error: any) {
    logger.error(`Erro ao consultar agenda: ${error.message}`);
    res.status(500).json({ message: 'Erro na consulta da Fortaleza.' });
  }
};

/**
 * 3. BLOQUEIO MANUAL (Poder do Diretor)
 */
export const blockSchedule = async (req: Request, res: Response) => {
  const { date, time, reason, fullDay } = req.body;

  try {
    const timesToBlock = fullDay 
      ? ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"] 
      : [time];

    const affectedBookings = await prisma.booking.findMany({
      where: {
        date: String(date),
        time: { in: timesToBlock },
        status: { notIn: ['blocked', 'cancelled', 'deleted'] } 
      },
      include: { client: true }
    });

    for (const booking of affectedBookings) {
      if (booking.client && booking.clientId !== 'ADMIN-ID') {
        const msg = `Olá ${booking.client.name}, aqui é do Studio Braz. Lamentamos, mas tivemos de cancelar o seu horário de ${booking.service} no dia ${booking.date} às ${booking.time}. Motivo: ${reason || 'Imprevisto no estúdio'}. Por favor, entre em contacto para reagendar!`;
        await sendNotification(booking.client.phone, booking.client.name, msg, 'sms');
      }
    }

    for (const t of timesToBlock) {
      await prisma.booking.upsert({
        where: { date_time: { date: String(date), time: t } },
        update: { status: 'blocked', service: 'BLOQUEIO_ADMIN' },
        create: {
          date: String(date),
          time: t,
          service: 'BLOQUEIO_ADMIN',
          status: 'blocked',
          clientId: 'ADMIN-ID', 
        }
      });
    }

    logger.info(`Agenda trancada em ${date}. ${affectedBookings.length} clientes notificados.`);
    res.json({ message: `Horários trancados e protegidos. ${affectedBookings.length} notificações enviadas.` });
  } catch (error: any) {
    logger.error(`Erro ao trancar horários: ${error.message}`);
    res.status(500).json({ message: 'Erro ao trancar na fortaleza.' });
  }
};

/**
 * 4. LISTAR TUDO (Dashboard do Diretor)
 */
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { client: true },
      orderBy: [{ date: 'desc' }, { time: 'desc' }]
    });
    res.json(bookings);
  } catch (error: any) {
    logger.error(`Erro na listagem: ${error.message}`);
    res.status(500).json({ message: 'Erro ao carregar a agenda mestra.' });
  }
};

/**
 * 5. ATUALIZAR STATUS & FIDELIZAÇÃO
 * Confirma o agendamento, dá pontos e envia o Email VIP de "Aguardamos por si".
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
      logger.info(`Fidelização: 10 pontos atribuídos a ${booking.client.name}`);

      // 🚀 GATILHO DE EMAIL: Dispara quando o Diretor clica no "Check" Verde
      await sendLuxuryEmail(
        booking.client.email, 
        'HORÁRIO CONFIRMADO • Studio Braz', 
        booking.client.name, 
        booking.service, 
        booking.date, 
        booking.time
      );
    }

    res.json(booking);
  } catch (error: any) {
    logger.error(`Erro ao atualizar status: ${error.message}`);
    res.status(500).json({ message: 'Erro ao processar a decisão no SQL.' });
  }
};

/**
 * 6. TOP 5 CLIENTES (Estatística VIP)
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
 * 7. ELIMINAÇÃO DEFINITIVA (Com Aviso Prévio)
 */
export const deleteBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { client: true }
    });

    if (booking && booking.client && booking.clientId !== 'ADMIN-ID') {
      const msg = `Olá ${booking.client.name}, aqui é do Studio Braz. Lamentamos, mas tivemos de desmarcar o seu horário de ${booking.service} no dia ${booking.date} às ${booking.time}. Motivo: ${reason || 'Ajuste de agenda'}. Entre em contacto para reagendar!`;
      await sendNotification(booking.client.phone, booking.client.name, msg, 'sms');
    }

    await prisma.booking.delete({
      where: { id }
    });
    
    logger.info(`Reserva ${id} eliminada. Horário libertado e cliente avisado.`);
    res.status(204).send(); 
  } catch (error: any) {
    logger.error(`Erro ao eliminar reserva: ${error.message}`);
    res.status(500).json({ message: 'Erro ao remover o registo.' });
  }
};