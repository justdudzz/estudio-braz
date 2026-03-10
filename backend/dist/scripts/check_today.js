import prisma from '../config/prisma.js';
async function main() {
    const today = new Date('2026-03-06T00:00:00Z');
    const b = await prisma.booking.findMany({
        where: {
            createdAt: { gte: today }
        },
        include: { client: true }
    });
    console.log('Bookings created today:', JSON.stringify(b, null, 2));
}
main().catch(console.error);
