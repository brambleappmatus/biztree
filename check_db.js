const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking for GalleryAlbum table...');
        // Try to count albums. If table doesn't exist, this will throw.
        const count = await prisma.galleryAlbum.count();
        console.log(`Success! Found ${count} albums.`);
    } catch (e) {
        console.error('Error: Could not access GalleryAlbum table.');
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
