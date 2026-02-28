import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

async function resetAdmin() {
  const email = 'diretor@studiobraz.com';
  const plainPassword = 'admin'; // Senha super simples para testar

  console.log('A forjar a nova Chave Mestra...');
  
  // Encripta a senha como manda a lei de 2026
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Cria ou atualiza o Diretor
  await prisma.user.upsert({
    where: { email: email },
    update: { password: hashedPassword, role: 'admin' },
    create: {
      email: email,
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('✅ CHAVE MESTRA FORÇADA COM SUCESSO!');
  console.log(`✉️  Email: ${email}`);
  console.log(`🔑 Senha: ${plainPassword}`);
}

resetAdmin()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());