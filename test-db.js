const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to database...');
        await prisma.$connect();
        console.log('Successfully connected to database!');

        const userCount = await prisma.user.count();
        console.log(`Found ${userCount} users.`);

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
