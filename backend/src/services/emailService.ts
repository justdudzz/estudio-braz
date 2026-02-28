import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendLuxuryEmail = async (to: string, subject: string, clientName: string, service: string, date: string, time: string) => {
  // ATENÇÃO: Coloque aqui o link real da foto do seu logo (ex: um link do Imgur, ou o link direto da imagem no seu site)
  const logoUrl = "logo.png"; // Substitua por um link real do seu logo

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Studio Braz <onboarding@resend.dev>',
      to: [to], 
      subject: subject,
      html: `
        <div style="background-color: #050505; color: #ffffff; font-family: 'Helvetica', sans-serif; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #D4AF37; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.1);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="Studio Braz Logo" style="max-width: 120px; height: auto; margin-bottom: 15px; border-radius: 50%; border: 2px solid #D4AF37;" />
            <h1 style="color: #D4AF37; text-transform: uppercase; letter-spacing: 5px; margin: 0; font-size: 24px;">Studio Braz</h1>
          </div>
          
          <div style="padding: 20px; text-align: center; border-top: 1px solid #222;">
            <p style="font-size: 18px; margin-bottom: 10px;">Olá, <strong style="color: #D4AF37;">${clientName}</strong>.</p>
            <p style="color: #aaa; font-size: 14px;">A sua marcação de excelência foi registada na nossa fortaleza.</p>
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
    console.log("✅ Email de luxo DOURADO enviado com sucesso para:", to);
    return data;
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return null;
  }
};