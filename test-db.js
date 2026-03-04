const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const perfumes = await prisma.perfume.findMany({
            include: {
                variants: true
            }
        });
        console.log('Success! Found perfumes:', perfumes.length);
        if (perfumes.length > 0) {
            console.log('First perfume:', perfumes[0].name);
        }
    } catch (error) {
        console.error('Database connection error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
