import prisma from '../config/prisma.js';

async function main() {
    const result = await prisma.booking.deleteMany({
        where: {
            createdAt: { gte: new Date('2026-03-06T00:00:00Z') }
        }
    });
    console.log(`Deleted ${result.count} bookings created today.`);
}

main().catch(console.error);
