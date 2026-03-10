import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 A SEMEAR DADOS DE ELITE NO SUPABASE...');

  // 1. Criar Mariana como Super Admin
  const adminPassword = await bcrypt.hash('StudioBraz2026!', 12);
  const mariana = await prisma.user.upsert({
    where: { email: 'mariana@studiobraz.com' },
    update: {},
    create: {
      email: 'mariana@studiobraz.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      displayName: 'Mariana Braz',
    },
  });
  console.log(`🛡️ Admin Mariana: PRONTA`);

  // 2. Criar Serviços Base
  const services = [
    { name: 'micro-soft', label: 'Microblading Soft Powder', duration: 120, price: 150.0, category: 'Sobrancelhas' },
    { name: 'unhas-gel', label: 'Aplicação de Gel c/ Extensão', duration: 90, price: 45.0, category: 'Unhas' },
    { name: 'pedicure-lux', label: 'Pedicure Spa Premium', duration: 60, price: 35.0, category: 'Pés' },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
  }
  console.log('💎 Serviços VIP: CARREGADOS');

  console.log('✅ SISTEMA STUDIO BRAZ INICIALIZADO COM SUCESSO NO MUNDO REAL.');
}

main()
  .catch((e) => {
    console.error('❌ Erro na sementeira:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
