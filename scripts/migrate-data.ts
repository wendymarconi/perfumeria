import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const NEON_URL = process.env.OLD_NEON_DATABASE_URL;
const SUPABASE_URL = process.env.DIRECT_URL; // Usamos la conexión directa para migraciones

async function migrate() {
    if (!NEON_URL || !SUPABASE_URL) {
        console.error('Error: Faltan URLs de base de datos en .env (OLD_NEON_DATABASE_URL o DIRECT_URL)');
        return;
    }

    const neon = new Client({ connectionString: NEON_URL });
    const supabase = new Client({ connectionString: SUPABASE_URL });

    try {
        console.log('--- INICIANDO PROCESO DE MIGRACIÓN ---');
        
        console.log('Conectando a Neon...');
        try {
            await neon.connect();
            console.log('✅ Conectado a Neon');
        } catch (e: any) {
            if (e.message.includes('quota exceeded')) {
                console.error('❌ ERROR: Neon sigue bloqueado por cuota. No se puede extraer el contenido.');
                return;
            }
            throw e;
        }

        console.log('Conectando a Supabase...');
        await supabase.connect();
        console.log('✅ Conectado a Supabase');

        // 1. Limpieza (Opcional, pero recomendado para una migración limpia)
        console.log('Limpiando datos actuales en Supabase...');
        await supabase.query('TRUNCATE "OrderItem", "OrderStatusHistory", "Order", "Variant", "Perfume", "HomeCarousel", "AdminUser" CASCADE');

        // 2. Migración de AdminUser
        console.log('Migrando AdminUser...');
        const adminUsers = await neon.query('SELECT * FROM "AdminUser"');
        for (const row of adminUsers.rows) {
            await supabase.query(
                'INSERT INTO "AdminUser" (id, email, password, "createdAt") VALUES ($1, $2, $3, $4)',
                [row.id, row.email, row.password, row.createdAt]
            );
        }

        // 3. Migración de HomeCarousel
        console.log('Migrando HomeCarousel...');
        const carousel = await neon.query('SELECT * FROM "HomeCarousel"');
        for (const row of carousel.rows) {
            await supabase.query(
                'INSERT INTO "HomeCarousel" (id, "imageUrl", title, subtitle, "order", "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
                [row.id, row.imageUrl, row.title, row.subtitle, row.order, row.createdAt]
            );
        }

        // 4. Migración de Perfume
        console.log('Migrando Perfumes...');
        const perfumes = await neon.query('SELECT * FROM "Perfume"');
        for (const row of perfumes.rows) {
            await supabase.query(
                'INSERT INTO "Perfume" (id, brand, name, gender, category, description, notes, accords, "mainImage", images, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
                [row.id, row.brand, row.name, row.gender, row.category, row.description, row.notes, row.accords, row.mainImage, row.images, row.createdAt, row.updatedAt]
            );
        }

        // 5. Migración de Variant
        console.log('Migrando Variantes...');
        const variants = await neon.query('SELECT * FROM "Variant"');
        for (const row of variants.rows) {
            await supabase.query(
                'INSERT INTO "Variant" (id, size, price, stock, "perfumeId") VALUES ($1, $2, $3, $4, $5)',
                [row.id, row.size, row.price, row.stock, row.perfumeId]
            );
        }

        // 6. Migración de Order
        console.log('Migrando Pedidos...');
        const orders = await neon.query('SELECT * FROM "Order"');
        for (const row of orders.rows) {
            await supabase.query(
                'INSERT INTO "Order" (id, "customerName", "customerEmail", total, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [row.id, row.customerName, row.customerEmail, row.total, row.status, row.createdAt, row.updatedAt]
            );
        }

        // 7. Migración de OrderStatusHistory
        console.log('Migrando Historial de Pedidos...');
        const histories = await neon.query('SELECT * FROM "OrderStatusHistory"');
        for (const row of histories.rows) {
            await supabase.query(
                'INSERT INTO "OrderStatusHistory" (id, "orderId", status, "createdAt") VALUES ($1, $2, $3, $4)',
                [row.id, row.orderId, row.status, row.createdAt]
            );
        }

        // 8. Migración de OrderItem
        console.log('Migrando Items de Pedidos...');
        const orderItems = await neon.query('SELECT * FROM "OrderItem"');
        for (const row of orderItems.rows) {
            await supabase.query(
                'INSERT INTO "OrderItem" (id, "orderId", "variantId", quantity, price) VALUES ($1, $2, $3, $4, $5)',
                [row.id, row.orderId, row.variantId, row.quantity, row.price]
            );
        }

        console.log('--- ✅ MIGRACIÓN COMPLETADA CON ÉXITO ---');

    } catch (error) {
        console.error('❌ ERROR CRÍTICO EN MIGRACIÓN:', error);
    } finally {
        await neon.end();
        await supabase.end();
    }
}

migrate();
