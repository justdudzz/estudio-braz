import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

async function seed() {
  const email = "admin@studiobraz.com";

  // Password obrigatória via variável de ambiente (#8)
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    console.error('❌ ERRO: Defina ADMIN_SEED_PASSWORD na variável de ambiente.');
    console.error('   Exemplo: ADMIN_SEED_PASSWORD=MinhaPass123! npx tsx src/scripts/seedAdmin.ts');
    process.exit(1);
  }

  // Política de password (#11)
  if (password.length < 12) {
    console.error('❌ ERRO: Password deve ter no mínimo 12 caracteres.');
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds (mais seguro)

    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('🔑 ACESSO MESTRE SQL CRIADO COM SUCESSO!');
    console.log(`✉️  Email: ${email}`);
    console.log('🔒 Password: [PROTEGIDA — definida via env var]');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar acesso mestre:', error);
    process.exit(1);
  }
}

seed();