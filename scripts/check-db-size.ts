import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const databaseSize = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database()))`;
    console.log('--- DATABASE STATUS ---');
    console.log('Size:', (databaseSize as any)[0].pg_size_pretty);

    const tables = ['Perfume', 'Variant', 'Order', 'OrderItem', 'HomeCarousel'];
    for (const table of tables) {
      const size = await prisma.$queryRawUnsafe(`SELECT pg_size_pretty(pg_total_relation_size('"${table}"'))`);
      console.log(`Table ${table} size:`, (size as any)[0].pg_size_pretty);
    }

    const perfumeCount = await prisma.perfume.count();
    console.log('Total Perfumes:', perfumeCount);

  } catch (error) {
    console.error('Error checking DB size:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
