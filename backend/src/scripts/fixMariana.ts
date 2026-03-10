import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

async function fix() {
  const email = 'mariana@studiobraz.com';
  const password = process.env.ADMIN_SEED_PASSWORD || 'StudioBraz2026!';
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      displayName: 'Mariana Braz',
      isTwoFactorEnabled: false,
      twoFactorSecret: null
    },
    create: {
      email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      displayName: 'Mariana Braz',
      isTwoFactorEnabled: false,
      twoFactorSecret: null
    }
  });

  console.log(`✅ Mariana (SUPER_ADMIN) resetada com sucesso!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

fix()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
