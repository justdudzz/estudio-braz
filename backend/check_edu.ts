import prisma from './src/config/prisma.js';

async function main() {
    const edu = await prisma.client.findFirst({ where: { name: { contains: 'edu', mode: 'insensitive' } } });
    if (!edu) {
        console.log('Client edu not found.');
        return;
    }
    const bookings = await prisma.booking.findMany({
        where: {
            clientId: edu.id
        }
    });
    console.log('Bookings for edu:', JSON.stringify(bookings, null, 2));
}

main().catch(console.error);
