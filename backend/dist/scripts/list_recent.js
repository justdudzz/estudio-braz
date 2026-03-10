import prisma from '../config/prisma.js';
async function main() {
    const all = await prisma.booking.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' }
    });
    console.log('Recent Bookings:', JSON.stringify(all, null, 2));
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
