import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
  const email = 'mariana@studiobraz.com';
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found');
    return;
  }
  console.log('User account status:', {
    email: user.email,
    role: (user as any).role,
    isTwoFactorEnabled: (user as any).isTwoFactorEnabled,
    displayName: (user as any).displayName
  });
  const passwordsToTry = ['StudioBraz2026!', 'Studiobraz2026!', 'BrazMaster2026!', 'BrazMaster2026'];
  for (const pw of passwordsToTry) {
     const match = await bcrypt.compare(pw, user.password);
     console.log(`Password "${pw}" matches: ${match}`);
  }
}

check().then(() => prisma.$disconnect());
