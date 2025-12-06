const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
    try {
        console.log('Checking database connection...');
        // Query to list all tables in the public schema
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

        console.log('Tables found in database:');
        console.table(tables);

        // Check specifically for BlogPost
        const blogPostTable = tables.find(t => t.table_name === 'BlogPost' || t.table_name === 'blogpost');

        if (blogPostTable) {
            console.log(`\n✅ Found table: ${blogPostTable.table_name}`);

            // Try to count records
            try {
                const count = await prisma.blogPost.count();
                console.log(`Count of posts: ${count}`);
            } catch (e) {
                console.error('Error counting posts (Prisma model might be mismatching table):', e.message);
            }
        } else {
            console.error('\n❌ Table "BlogPost" NOT found!');
        }

    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
