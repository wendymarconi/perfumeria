import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando volcado de la base de datos de Neon...');

  // Extraemos datos de todas las tablas importantes
  const perfumes = await prisma.perfume.findMany();
  const variants = await prisma.variant.findMany();
  const adminUsers = await prisma.adminUser.findMany();
  const carousels = await prisma.homeCarousel.findMany();
  const orders = await prisma.order.findMany();
  const orderItems = await prisma.orderItem.findMany();
  const orderStatusHistories = await prisma.orderStatusHistory.findMany();

  const dataToBackup = {
    perfumes,
    variants,
    adminUsers,
    carousels,
    orders,
    orderItems,
    orderStatusHistories,
  };

  const backupFilePath = path.join(__dirname, '..', 'backup.json');
  fs.writeFileSync(backupFilePath, JSON.stringify(dataToBackup, null, 2));

  console.log(`Backup creado con éxito en: ${backupFilePath}`);
  console.log(`- Perfumes: ${perfumes.length}`);
  console.log(`- Variantes: ${variants.length}`);
  console.log(`- AdminUsers: ${adminUsers.length}`);
  console.log(`- Banners: ${carousels.length}`);
  console.log(`- Paquetes de Órdenes: ${orders.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
