import prisma from '../config/prisma.js';
async function main() {
    const id = 'd1683448-d74b-40cf-ad5b-7432fd9260be';
    const bookings = await prisma.booking.findMany({
        where: {
            clientId: id,
            deletedAt: null
        }
    });
    console.log('Active Bookings for edu:', JSON.stringify(bookings, null, 2));
}
main().catch(console.error);
