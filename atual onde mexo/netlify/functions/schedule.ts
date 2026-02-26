import { Handler } from '@netlify/functions';
import { google } from 'googleapis';

// ──────────────────────────────────────────────────────────────
// TABELA DA VERDADE (Backend Seguro)
// O servidor é soberano. Nunca confia no frontend.
// ──────────────────────────────────────────────────────────────
const SERVICES_DB: Record<string, { duration: number; buffer: number }> = {
  'Microblading':     { duration: 150, buffer: 15 },   // 2h30 + 15m limpeza
  'Limpeza de Pele':  { duration: 90,  buffer: 15 },   // 1h30 + 15m
  'Unhas de Gel':     { duration: 90,  buffer: 10 },   // 1h30 + 10m
  'Verniz Gel':       { duration: 45,  buffer: 5 },    // 45m + 5m
  'Massagem':         { duration: 60,  buffer: 15 },   // 1h00 + 15m
  'Depilacao':        { duration: 30,  buffer: 5 },    // 30m + 5m
};

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// 🟢 CORREÇÃO AQUI: "Juntando os dois"
// 1. Tenta ler a variável de ambiente (GOOGLE_CALENDAR_ID) configurada no Netlify.
// 2. Se não existir, usa o email direto (substitua pelo email real da Mariana).
const calendarId = process.env.GOOGLE_CALENDAR_ID || 'edutavfer32@gmail.com'; 

const getAuthClient = () => {
  // Limpeza obrigatória da chave privada (evita erro de formatação)
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  return new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    privateKey,
    SCOPES
  );
};

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const auth = getAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    // ────────────────────── GET: Buscar eventos ocupados ──────────────────────
    if (event.httpMethod === 'GET') {
      const date = event.queryStringParameters?.date;
      if (!date) {
        return { 
          statusCode: 400, 
          headers, 
          body: JSON.stringify({ message: 'Data obrigatória' }) 
        };
      }

      const timeMin = new Date(`${date}T00:00:00Z`).toISOString();
      const timeMax = new Date(`${date}T23:59:59Z`).toISOString();

      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data.items || []),
      };
    }

    // ────────────────────── POST: Criar agendamento ──────────────────────
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const { name, email, phone, service, date, time } = data;

      // Validação básica
      if (!name || !email || !date || !time || !service) {
        return { 
          statusCode: 400, 
          headers, 
          body: JSON.stringify({ message: 'Dados incompletos' }) 
        };
      }

      // Segurança: só aceitamos serviços que existem na tabela
      const serviceRule = SERVICES_DB[service];
      if (!serviceRule) {
        console.error(`Tentativa de serviço inválido: ${service}`);
        return { 
          statusCode: 400, 
          headers, 
          body: JSON.stringify({ message: 'Serviço inválido.' }) 
        };
      }

      // Cálculo 100% seguro (nunca confiamos no cliente)
      const safeDuration = serviceRule.duration + serviceRule.buffer;

      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + safeDuration * 60000);

      // Dupla verificação anti-conflito (último milissegundo)
      const conflictCheck = await calendar.events.list({
        calendarId,
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        singleEvents: true,
      });

      if (conflictCheck.data.items && conflictCheck.data.items.length > 0) {
        return { 
          statusCode: 409, 
          headers, 
          body: JSON.stringify({ message: 'Horário ocupado' }) 
        };
      }

      // Gravar no Google Calendar
      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `${name} - ${service}`,
          description: `Cliente: ${name}\nTelemóvel: ${phone}\nEmail: ${email}\nServiço: ${service}\nDuração real calculada: ${safeDuration} min`,
          start: { 
            dateTime: startDateTime.toISOString(),
            timeZone: 'Europe/Lisbon',
          },
          end: { 
            dateTime: endDateTime.toISOString(),
            timeZone: 'Europe/Lisbon',
          },
          colorId: '2',
        },
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ message: 'Method Not Allowed' }) 
    };

  } catch (error: any) {
    console.error('Erro Google Calendar:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno no servidor.' }),
    };
  }
};