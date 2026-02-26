import { Handler } from '@netlify/functions';
import { google } from 'googleapis';
import crypto from 'crypto';

// ──────────────────────────────────────────────────────────────
// CONFIGURAÇÕES E TABELA DA VERDADE
// ──────────────────────────────────────────────────────────────
const SERVICES_DB: Record<string, { duration: number; buffer: number }> = {
  'Microblading':     { duration: 150, buffer: 15 },
  'Limpeza de Pele':  { duration: 90,  buffer: 15 },
  'Unhas de Gel':     { duration: 90,  buffer: 10 },
  'Verniz Gel':       { duration: 45,  buffer: 5 },
  'Massagem':         { duration: 60,  buffer: 15 },
  'Depilacao':        { duration: 30,  buffer: 5 },
};

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const calendarId = process.env.GOOGLE_CALENDAR_ID;

// ──────────────────────────────────────────────────────────────
// RATE LIMITING (Prevenção de Abuso)
// ──────────────────────────────────────────────────────────────
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60000;
const MAX_REQUESTS = 5;

const generateFingerprint = (ip: string, userAgent: string): string => {
  return crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
};

const isRateLimited = (fingerprint: string): boolean => {
  const now = Date.now();
  const record = rateLimitCache.get(fingerprint);

  if (!record || now - record.timestamp > WINDOW_MS) {
    rateLimitCache.set(fingerprint, { count: 1, timestamp: now });
    return false;
  }
  
  if (record.count >= MAX_REQUESTS) return true;
  
  record.count += 1;
  return false;
};

// ──────────────────────────────────────────────────────────────
// CLIENTE DE AUTENTICAÇÃO (Evoluído & Otimizado)
// ──────────────────────────────────────────────────────────────
const getAuthClient = () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail || !calendarId) {
    console.error("❌ Erro de Configuração: Variáveis de ambiente ausentes.");
    throw new Error('PRIVATE_KEY_VOID_OR_CONFIG_MISSING');
  }

  return new google.auth.JWT(
    clientEmail,
    null,
    privateKey,
    SCOPES
  );
};

// ──────────────────────────────────────────────────────────────
// HANDLER PRINCIPAL
// ──────────────────────────────────────────────────────────────
export const handler: Handler = async (event) => {
  const securityHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: securityHeaders, body: '' };
  }

  // Rate Limiting Check
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  const userAgent = event.headers['user-agent'] || 'unknown';
  const fingerprint = generateFingerprint(ip, userAgent);

  if (isRateLimited(fingerprint)) {
    // Retorno silencioso para mitigar ataques de força bruta
    return { statusCode: 200, headers: securityHeaders, body: JSON.stringify({ success: true, status: 'queued' }) };
  }

  try {
    const auth = getAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    // 1. GET: Listar ocupação para o cálculo de slots no frontend
    if (event.httpMethod === 'GET') {
      const date = event.queryStringParameters?.date;
      if (!date) return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'MISSING_DATE' }) };

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
        headers: securityHeaders,
        body: JSON.stringify(response.data.items || []),
      };
    }

    // 2. POST: Criar novo agendamento
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const { name, email, phone, service, date, time } = data;

      if (!name || !email || !date || !time || !service) {
        return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'INCOMPLETE_PAYLOAD' }) };
      }

      const serviceRule = SERVICES_DB[service];
      if (!serviceRule) {
        return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'INVALID_SERVICE' }) };
      }

      const safeDuration = serviceRule.duration + serviceRule.buffer;
      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + safeDuration * 60000);

      // Verificação de última hora contra Double Booking
      const conflictCheck = await calendar.events.list({
        calendarId,
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        singleEvents: true,
      });

      if (conflictCheck.data.items && conflictCheck.data.items.length > 0) {
        return { statusCode: 409, headers: securityHeaders, body: JSON.stringify({ error: 'SLOT_UNAVAILABLE' }) };
      }

      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `${name} - ${service}`,
          description: `Cliente: ${name}\nTelemóvel: ${phone}\nEmail: ${email}\nServiço: ${service}\nDuração Total: ${safeDuration}m`,
          start: { dateTime: startDateTime.toISOString(), timeZone: 'Europe/Lisbon' },
          end: { dateTime: endDateTime.toISOString(), timeZone: 'Europe/Lisbon' },
          colorId: '2', // Cor definida para agendamentos externos
        },
      });

      return { statusCode: 200, headers: securityHeaders, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers: securityHeaders, body: JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }) };

  } catch (error: any) {
    console.error("🔥 Server Error:", error.message);
    return {
      statusCode: error.message === 'PRIVATE_KEY_VOID_OR_CONFIG_MISSING' ? 500 : 500,
      headers: securityHeaders,
      body: JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', detail: error.message }),
    };
  }
};