import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

process.env.DATABASE_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function main() {
    console.log('--- TEST CREATE PRODUCT ---');
    try {
        const product = await prisma.perfume.create({
            data: {
                brand: "Test Brand",
                name: "Test Name",
                category: "Nicho",
                description: "Test Description",
                mainImage: "https://via.placeholder.com/150",
                gender: "Unisex",
                notes: "",
                accords: "[]",
                images: "[]",
                variants: {
                    create: [
                        { size: "50ml", price: 1000, stock: 10 }
                    ]
                }
            }
        });
        console.log("Success! Created perfume:", product.id);

        // Limpiar después de crear
        await prisma.perfume.delete({
            where: { id: product.id }
        });
        console.log("Cleanup: Deleted test perfume.");
    } catch (error) {
        console.error("Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
