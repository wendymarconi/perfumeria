import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Clear existing data (in correct order for foreign keys)
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.variant.deleteMany();
    await prisma.perfume.deleteMany();

    const perfumes = [
        {
            brand: "Creed",
            name: "Aventus",
            gender: "Male",
            category: "Nicho",
            description: "El perfume mas iconico de la casa Creed, una mezcla de fuerza, vision y exito.",
            notes: "Top: Pinapple, Bergamot; Heart: Birch, Patchouli; Base: Musk, Oakmoss",
            mainImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
            images: "[]",
            variants: {
                create: [
                    { size: "5ml", price: 25.0, stock: 10 },
                    { size: "10ml", price: 45.0, stock: 8 },
                    { size: "100ml", price: 350.0, stock: 0 },
                ],
            },
        },
        {
            brand: "Tom Ford",
            name: "Tobacco Vanille",
            gender: "Unisex",
            category: "Nicho",
            description: "Opulento, calido e iconico. Una reinterpretacion moderna de un club de caballeros clasico.",
            notes: "Top: Tobacco Leaf, Spices; Heart: Vanilla, Cacao; Base: Dried Fruits, Woody Notes",
            mainImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
            images: "[]",
            variants: {
                create: [
                    { size: "5ml", price: 30.0, stock: 12 },
                    { size: "10ml", price: 55.0, stock: 6 },
                    { size: "50ml", price: 280.0, stock: 3 },
                ],
            },
        },
        {
            brand: "Parfums de Marly",
            name: "Layton",
            gender: "Unisex",
            category: "Nicho",
            description: "Una fragancia adictiva y masculina, que combina elegancia y nobleza.",
            notes: "Top: Apple, Lavender; Heart: Jasmine, Violet; Base: Vanilla, Cardamom",
            mainImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
            images: "[]",
            variants: {
                create: [
                    { size: "5ml", price: 20.0, stock: 15 },
                    { size: "10ml", price: 38.0, stock: 9 },
                    { size: "125ml", price: 230.0, stock: 5 },
                ],
            },
        },
    ];

    for (const p of perfumes) {
        await prisma.perfume.create({
            data: p,
        });
    }

    console.log("Seeding finished!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
