import { Handler } from '@netlify/functions';
import { google } from 'googleapis';
import crypto from 'crypto';

// ──────────────────────────────────────────────────────────────
// 1. DICIONÁRIO DE SERVIÇOS
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
// 2. RATE LIMITING (L7 em memória – proteção contra abuso)
// ──────────────────────────────────────────────────────────────
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60000;     // 1 minuto
const MAX_REQUESTS = 5;

const generateFingerprint = (ip: string, userAgent: string): string => 
  crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');

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
// 3. AUTH CLIENT COM MOCK MODE (resiliente para dev/staging)
// ──────────────────────────────────────────────────────────────
const getAuthClient = () => {
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  
  // ESCUDO: Se não tiver chave válida → entra em Mock Mode
  if (!privateKey || 
      privateKey.includes('...') || 
      privateKey === 'your_private_key_here') {
    return null;
  }

  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail || !calendarId) {
    return null; // Mock Mode ativado
  }

  try {
    return new google.auth.JWT(clientEmail, null, privateKey, SCOPES);
  } catch (e) {
    console.error('Erro ao criar JWT Auth:', e);
    return null;
  }
};

// ──────────────────────────────────────────────────────────────
// 4. HANDLER PRINCIPAL (Netlify Function)
// ──────────────────────────────────────────────────────────────
export const handler: Handler = async (event) => {
  const securityHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };

  // Pre-flight (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: securityHeaders, body: '' };
  }

  // Rate Limiting
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  const userAgent = event.headers['user-agent'] || 'unknown';
  const fingerprint = generateFingerprint(ip, userAgent);

  if (isRateLimited(fingerprint)) {
    return { 
      statusCode: 429, 
      headers: securityHeaders, 
      body: JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }) 
    };
  }

  try {
    const auth = getAuthClient();
    const isMockMode = !auth || !calendarId;

    // ====================== GET: Listar eventos do dia ======================
    if (event.httpMethod === 'GET') {
      const date = event.queryStringParameters?.date;
      
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'INVALID_DATE_FORMAT' }) };
      }

      const requestDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (requestDate <= today) {
        return { statusCode: 403, headers: securityHeaders, body: JSON.stringify({ error: 'DATE_NOT_ALLOWED' }) };
      }

      // MOCK MODE
      if (isMockMode) {
        return { 
          statusCode: 200, 
          headers: securityHeaders, 
          body: JSON.stringify([]) 
        };
      }

      const calendar = google.calendar({ version: 'v3', auth });
      const timeMin = new Date(`${date}T00:00:00Z`).toISOString();
      const timeMax = new Date(`${date}T23:59:59Z`).toISOString();

      const response = await calendar.events.list({ 
        calendarId, 
        timeMin, 
        timeMax, 
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      return { 
        statusCode: 200, 
        headers: securityHeaders, 
        body: JSON.stringify(response.data.items || []) 
      };
    }

    // ====================== POST: Criar agendamento ======================
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

      // MOCK MODE
      if (isMockMode) {
        return { 
          statusCode: 200, 
          headers: securityHeaders, 
          body: JSON.stringify({ success: true, mock: true }) 
        };
      }

      const safeDuration = serviceRule.duration + serviceRule.buffer;
      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + safeDuration * 60000);

      const calendar = google.calendar({ version: 'v3', auth });

      // Verificação de conflito (double-booking)
      const conflictCheck = await calendar.events.list({ 
        calendarId, 
        timeMin: startDateTime.toISOString(), 
        timeMax: endDateTime.toISOString(), 
        singleEvents: true 
      });
      
      if (conflictCheck.data.items && conflictCheck.data.items.length > 0) {
        return { statusCode: 409, headers: securityHeaders, body: JSON.stringify({ error: 'SLOT_UNAVAILABLE' }) };
      }

      // Inserir evento
      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `${name} - ${service}`,
          description: `Cliente: ${name}\nTelemóvel: ${phone}\nEmail: ${email}\nServiço: ${service}\nDuração Total: ${safeDuration}min`,
          start: { dateTime: startDateTime.toISOString(), timeZone: 'Europe/Lisbon' },
          end: { dateTime: endDateTime.toISOString(), timeZone: 'Europe/Lisbon' },
          colorId: '2',
        },
      });
      
      return { statusCode: 200, headers: securityHeaders, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers: securityHeaders, body: JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }) };

  } catch (error: any) {
    console.error("🔥 Server Error:", error.message);
    return { 
      statusCode: 500, 
      headers: securityHeaders, 
      body: JSON.stringify({ 
        error: 'INTERNAL_SERVER_ERROR', 
        detail: error.message 
      }) 
    };
  }
};