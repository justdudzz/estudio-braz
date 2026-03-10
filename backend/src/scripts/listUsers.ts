import prisma from '../config/prisma.js';

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      displayName: true
    }
  });
  console.log('Users in database:');
  console.log(JSON.stringify(users, null, 2));
}

listUsers()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
