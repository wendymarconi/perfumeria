import { PrismaClient } from "@prisma/client";

async function main() {
    const prisma = new PrismaClient();
    try {
        const perfumes = await prisma.perfume.findMany({ take: 1 });
        console.log("Success! Found perfumes:", perfumes.length);
    } catch (e) {
        console.error("Prisma Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
