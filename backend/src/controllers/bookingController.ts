// backend/src/controllers/bookingController.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../utils/logger';
import { sendNotification } from '../services/notificationService';
import { sendLuxuryEmail } from '../services/emailService'; 

// 🛠️ DICIONÁRIO DE DURAÇÕES (em minutos)
const SERVICE_DURATIONS: Record<string, number> = {
  'Microblading': 150, // 2h30
  'Manicure': 60,      // 1h
  'Pedicure': 60,      // 1h
  'BLOQUEIO_ADMIN': 60 // Padrão para bloqueios do diretor
};

/**
 * 1. CRIAR AGENDAMENTO (Motor de Fusão Soberana)
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

    // 📧 5. Envio de Email Seguro
    if (masterClient.email) {
      try {
        await sendLuxuryEmail(masterClient.email, 'Agendamento Confirmado • Studio Braz', masterClient.name, service, date, time);
      } catch (e) { console.error("⚠️ Erro no envio de email, mas sistema operou normalmente."); }
    }

    return res.status(201).json(booking);

  } catch (error: any) {
    console.error("❌ ERRO NA FORTALEZA:", error);
    
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

    bookings.forEach(b => {
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
    logger.error(`Erro na Fortaleza: ${error.message}`);
    res.status(500).json([]);
  }
};

/**
 * 3. BLOQUEIO MANUAL (Poder do Diretor)
 */
export const blockSchedule = async (req: Request, res: Response) => {
  const { date, time, reason, fullDay } = req.body;

  try {
    const timesToBlock = fullDay 
      ? ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"] 
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
      if (booking.client && booking.clientId !== 'ADMIN-ID' && booking.client.phone) {
        const msg = `Olá ${booking.client.name}, aqui é do Studio Braz. Lamentamos, mas tivemos de cancelar o seu horário de ${booking.service} no dia ${booking.date} às ${booking.time}. Motivo: ${reason || 'Imprevisto no estúdio'}.`;
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

    res.json({ message: `Horários trancados. ${affectedBookings.length} clientes avisados.` });
  } catch (error: any) {
    logger.error(`Erro ao trancar horários: ${error.message}`);
    res.status(500).json({ message: 'Erro ao trancar na fortaleza.' });
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
        try {
          await sendLuxuryEmail(booking.client.email, 'HORÁRIO CONFIRMADO • Studio Braz', booking.client.name, booking.service, booking.date, booking.time);
        } catch (e) {
          console.error("⚠️ Falha ao notificar cliente.");
        }
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