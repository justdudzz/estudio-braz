import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

// 1. Garante que as credenciais são lidas do .env
dotenv.config();

// 2. Cria a ligação direta (Pool) ao PostgreSQL usando o driver nativo 'pg'
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 3. Traduz a ligação para o Prisma 7 entender
const adapter = new PrismaPg(pool);

// 4. Inicia o Motor com o novo Adaptador
const prisma = new PrismaClient({ adapter });

export default prisma;