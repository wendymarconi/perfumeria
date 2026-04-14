import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import * as dotenv from 'dotenv';
dotenv.config();

// Use DIRECT_URL for direct push
process.env.DATABASE_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL
        }
    }
});

async function compressBase64(base64Str: string): Promise<string> {
    if (!base64Str || !base64Str.startsWith('data:image')) return base64Str;
    
    try {
        const parts = base64Str.split(';');
        if (parts.length < 2) return base64Str;
        
        const mime = parts[0].split(':')[1];
        const imageData = base64Str.split(',')[1];
        const buffer = Buffer.from(imageData, 'base64');
        
        // Skip if already small (e.g. < 100KB)
        if (buffer.length < 100000) return base64Str;

        console.log(`  Compressing image of ${Math.round(buffer.length / 1024)} KB...`);
        
        const compressedBuffer = await sharp(buffer)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 75, progressive: true })
            .toBuffer();
            
        console.log(`  Done: ${Math.round(compressedBuffer.length / 1024)} KB`);
        return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    } catch (error) {
        console.error('  Compression failed:', error);
        return base64Str;
    }
}

async function main() {
    console.log('--- STARTING REMOTE DATABASE OPTIMIZATION ---');
    try {
        // 1. Optimize Perfumes
        const perfumes = await prisma.perfume.findMany();
        console.log(`Found ${perfumes.length} perfumes to check.`);
        
        for (const perfume of perfumes) {
            console.log(`Checking perfume: ${perfume.name}`);
            let needsUpdate = false;
            
            // Main Image
            const optimizedMain = await compressBase64(perfume.mainImage);
            if (optimizedMain !== perfume.mainImage) needsUpdate = true;
            
            // Secondary Images
            let imagesArray: string[] = [];
            try {
                imagesArray = JSON.parse(perfume.images || '[]');
            } catch (e) {
                imagesArray = perfume.mainImage ? [perfume.mainImage] : [];
            }
            
            const optimizedImages = [];
            for (const img of imagesArray) {
                const optImg = await compressBase64(img);
                if (optImg !== img) needsUpdate = true;
                optimizedImages.push(optImg);
            }
            
            if (needsUpdate) {
                console.log(`Updating ${perfume.name}...`);
                await prisma.perfume.update({
                    where: { id: perfume.id },
                    data: {
                        mainImage: optimizedMain,
                        images: JSON.stringify(optimizedImages)
                    }
                });
                console.log(`[SUCCESS] ${perfume.name} optimized.`);
            } else {
                console.log(`[SKIP] ${perfume.name} already optimized.`);
            }
        }

        // 2. Optimize Carousel
        const carousel = await prisma.homeCarousel.findMany();
        console.log(`Found ${carousel.length} carousel images to check.`);
        for (const item of carousel) {
            console.log(`Checking carousel item: ${item.id}`);
            const optimizedImg = await compressBase64(item.imageUrl);
            if (optimizedImg !== item.imageUrl) {
                await prisma.homeCarousel.update({
                    where: { id: item.id },
                    data: { imageUrl: optimizedImg }
                });
                console.log(`[SUCCESS] Carousel item optimized.`);
            }
        }

    } catch (error) {
        console.error('CRITICAL ERROR in optimization script:', error);
    } finally {
        await prisma.$disconnect();
    }
    console.log('--- OPTIMIZATION FINISHED ---');
}

main();
