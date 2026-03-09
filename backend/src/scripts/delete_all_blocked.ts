import prisma from '../config/prisma.js';

async function main() {
    const result = await prisma.booking.deleteMany({
        where: {
            status: 'blocked'
        }
    });
    console.log(`Deleted ${result.count} blocked slots.`);
}

main().catch(console.error);
