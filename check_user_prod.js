// Quick script to check user and account status in production
// Run with: node check_user_prod.js <email>

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL // Make sure this points to production
});

async function checkUser(email) {
    console.log(`\n🔍 Checking user: ${email}\n`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            accounts: true,
            sessions: true
        }
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log('✅ User found:');
    console.log(JSON.stringify({
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        hasPassword: !!user.password,
        createdAt: user.createdAt
    }, null, 2));

    console.log('\n📎 Linked Accounts:');
    if (user.accounts.length === 0) {
        console.log('  No accounts linked');
    } else {
        user.accounts.forEach(account => {
            console.log(`  - ${account.provider} (${account.providerAccountId})`);
        });
    }

    console.log('\n🔐 Active Sessions:', user.sessions.length);

    await prisma.$disconnect();
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node check_user_prod.js <email>');
    process.exit(1);
}

checkUser(email).catch(console.error);
