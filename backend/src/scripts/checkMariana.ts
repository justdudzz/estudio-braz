import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.user.findMany({ where: { email: { contains: 'mariana' } } }).then(u => {
  console.log('Mariana accounts found:', u.map(x => x.email));
}).finally(() => p.$disconnect());
