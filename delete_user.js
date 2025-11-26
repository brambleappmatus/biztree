const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
    const email = 'matusstano@icloud.com';
    console.log(`Deleting user with email: ${email}`);

    try {
        const deleteUser = await prisma.user.delete({
            where: { email },
        });
        console.log('User deleted successfully:', deleteUser);
    } catch (error) {
        if (error.code === 'P2025') {
            console.log('User not found, nothing to delete.');
        } else {
            console.error('Error deleting user:', error);
        }
    }
}

deleteUser()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
