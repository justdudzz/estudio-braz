import prisma from './src/config/prisma.js';

async function main() {
    const result = await prisma.booking.deleteMany({
        where: {
            status: 'blocked',
            service: 'BLOQUEIO_ADMIN'
        }
    });
    console.log(`Successfully deleted ${result.count} blocked slots.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
