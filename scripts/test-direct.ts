import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

// We'll manually override the env var for this test to use DIRECT_URL
process.env.DATABASE_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function main() {
  console.log('--- ATTEMPTING DIRECT CONNECTION ---');
  try {
    const databaseSize = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database()))`;
    console.log('Size:', (databaseSize as any)[0].pg_size_pretty);

    const perfumeCount = await prisma.perfume.count();
    console.log('Total Perfumes:', perfumeCount);
    
    // Check for large images
    const perfumes = await prisma.perfume.findMany({
        select: { id: true, name: true, mainImage: true },
        take: 5
    });
    
    for (const p of perfumes) {
        console.log(`Product: ${p.name}, Image Length: ${p.mainImage?.length || 0}`);
    }

  } catch (error) {
    console.error('Direct Connection Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
