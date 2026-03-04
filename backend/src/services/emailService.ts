import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Configuração SMTP via variáveis de ambiente
const createTransporter = () => {
  // Se SMTP está configurado com password, usa as credenciais reais
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para porta 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Falha amigável quando não há credenciais de email configuradas
  logger.error('❌ CREDENCIAIS DE EMAIL (SMTP) NÃO CONFIGURADAS. Emails não serão enviados aos clientes.');
  return {
    sendMail: async () => ({ messageId: 'simulated-no-config' })
  } as any;
};

const transporter = createTransporter();

export const sendLuxuryEmail = async (
  to: string,
  subject: string,
  clientName: string,
  service: string,
  date: string,
  time: string,
  retries = 3 // 🛡️ Sistema de Re-tentativas (Point #22)
) => {
  const logoUrl = "https://estudiobraz.pt/logo.png";
  const fromEmail = process.env.SMTP_FROM || 'Studio Braz <noreply@estudiobraz.pt>';

  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: subject,
        html: `
          <div style="background-color: #050505; color: #ffffff; font-family: 'Helvetica', sans-serif; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #D4AF37; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.1);">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="Studio Braz Logo" style="max-width: 120px; height: auto; margin-bottom: 15px; border-radius: 50%; border: 2px solid #D4AF37;" />
              <h1 style="color: #D4AF37; text-transform: uppercase; letter-spacing: 5px; margin: 0; font-size: 24px;">Studio Braz</h1>
            </div>
            
            <div style="padding: 20px; text-align: center; border-top: 1px solid #222;">
              <p style="font-size: 18px; margin-bottom: 10px;">Olá, <strong style="color: #D4AF37;">${clientName}</strong>.</p>
              <p style="color: #aaa; font-size: 14px;">A sua marcação foi registada com sucesso no nosso sistema.</p>
            </div>

            <div style="background-color: #111; padding: 25px; border-radius: 15px; margin: 20px 0; border: 1px solid #333; text-align: center;">
              <p style="margin: 10px 0; font-size: 15px;"><strong style="color: #D4AF37; letter-spacing: 1px;">SERVIÇO:</strong> <span style="color: #fff;">${service}</span></p>
              <p style="margin: 10px 0; font-size: 15px;"><strong style="color: #D4AF37; letter-spacing: 1px;">DATA:</strong> <span style="color: #fff;">${date}</span></p>
              <p style="margin: 10px 0; font-size: 15px;"><strong style="color: #D4AF37; letter-spacing: 1px;">HORÁRIO:</strong> <span style="color: #fff;">${time}</span></p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 11px; color: #D4AF37; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
                Aguardamos a sua presença.
              </p>
            </div>

            <p style="text-align: center; font-size: 10px; color: #555; margin-top: 40px; border-top: 1px solid #111; padding-top: 20px; text-transform: uppercase; letter-spacing: 1px;">
              Rua do Estúdio, 123 • Aveiro, Portugal<br>
              © 2026 Studio Braz - Gestão de Elite
            </p>
          </div>
        `,
      });

      logger.info(`✅ Email enviado para: ${to} | Tentativa: ${i + 1}`);
      return info;
    } catch (error) {
      logger.warn(`⚠️ Falha no envio de email (${i + 1}/${retries}): ${error}`);
      if (i === retries - 1) {
        logger.error(`❌ ERRO DEFINITIVO no envio para ${to}: ${error}`);
        return null;
      }
      // Backoff exponencial simples: 2s, 4s...
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i + 1) * 1000));
    }
  }
};
