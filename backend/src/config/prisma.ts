import { PrismaClient } from '@prisma/client';

// Cria uma instância única do banco de dados para todo o servidor
const prisma = new PrismaClient();

export default prisma;