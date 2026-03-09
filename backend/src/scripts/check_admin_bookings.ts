import prisma from '../config/prisma.js';

async function main() {
    const adminClient = await prisma.client.findUnique({ where: { email: 'system@studiobraz.internal' } });
    if (!adminClient) {
        console.log('Admin client not found.');
        return;
    }
    const bookings = await prisma.booking.findMany({
        where: {
            clientId: adminClient.id
        }
    });
    console.log('Admin Bookings:', JSON.stringify(bookings, null, 2));
}

main().catch(console.error);
