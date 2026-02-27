import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../utils/logger';

// 1. Criar Agendamento (Com Lógica Relacional)
export const createBooking = async (req: Request, res: Response) => {
  const { name, email, phone, service, date, time } = req.body;

  try {
    // A mágica do Prisma: Procura a cliente pelo email. 
    // Se não existir, cria uma nova. Se existir, usa a mesma (Soberania de Dados).
    const booking = await prisma.booking.create({
      data: {
        date,
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
    res.status(201).json(booking);

  } catch (error: any) {
    // Ponto 10 da auditoria: Se o PostgreSQL travar por horário duplicado
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Este horário já foi conquistado por outra cliente.' });
    }
    
    logger.error(`Erro ao criar agendamento SQL: ${error.message}`);
    res.status(500).json({ message: 'Erro ao processar o agendamento na fortaleza.' });
  }
};

// 2. Verificar Horários Ocupados
export const getBusySlots = async (req: Request, res: Response) => {
  const { date } = req.query;

  try {
    const busyBookings = await prisma.booking.findMany({
      where: { 
        date: String(date),
        status: { not: 'cancelled' } 
      },
      select: { time: true }
    });

    const times = busyBookings.map(b => b.time);
    res.json(times);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao consultar agenda.' });
  }
};

// 3. Listar Tudo (Para a Sala de Comando do Diretor)
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { 
        client: true // Traz os dados da cliente automaticamente (Relacional)
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao carregar a agenda mestra.' });
  }
};