import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Força o carregamento do .env local
dotenv.config({ path: path.join(__dirname, '../../.env') });
const prisma = new PrismaClient({
    log: ['error'], // Reduz verbosidade para focar no erro real
});
export default prisma;
