import prisma from './src/config/prisma.js';

async function main() {
    const result = await prisma.booking.deleteMany({
        where: {
            service: 'BLOQUEIO_ADMIN'
        }
    });
    console.log(`Deleted ${result.count} bookings with service BLOQUEIO_ADMIN.`);
}

main().catch(console.error);
