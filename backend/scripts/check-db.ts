import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const all = await prisma.booking.findMany({ select: { id: true, date: true, status: true, totalPrice: true } });
    console.log(all);
}
main().catch(console.error).finally(() => prisma.$disconnect());
