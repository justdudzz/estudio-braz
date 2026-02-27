import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

async function seed() {
  const email = "admin@studiobraz.com";
  const password = "SuaSenhaForteAqui123"; // Mude para a sua senha de eleição

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

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
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar acesso mestre:', error);
    process.exit(1);
  }
}

seed();