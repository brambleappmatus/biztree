const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const email = 'matusstano@icloud.com'; // The email from the screenshot
    console.log(`Checking for user with email: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true }
    });

    if (user) {
        console.log('User found:', user);
        console.log('Linked Accounts:', user.accounts);
    } else {
        console.log('User not found.');
    }
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
