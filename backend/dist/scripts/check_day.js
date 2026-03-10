import prisma from '../config/prisma.js';
async function main() {
    const b = await prisma.booking.findMany({ where: { date: '2026-03-14' } });
    console.log('Bookings on 2026-03-14:', JSON.stringify(b, null, 2));
}
main().catch(console.error);
