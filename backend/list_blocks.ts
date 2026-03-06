import prisma from './src/config/prisma.js';

async function main() {
    const blocks = await prisma.booking.findMany({
        where: {
            status: 'blocked'
        }
    });
    console.log('Blocked Bookings:', JSON.stringify(blocks, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
