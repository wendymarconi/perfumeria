"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
    customerName: string;
    customerEmail: string;
    items: {
        variantId: string;
        quantity: number;
        price: number;
    }[];
    total: number;
}) {
    try {
        const order = await prisma.order.create({
            data: {
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                total: data.total,
                status: "PENDING",
                items: {
                    create: data.items.map(item => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
        });

        revalidatePath("/admin");
        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Failed to create order:", error);
        return { success: false, error: "Failed to create order" };
    }
}

export async function getOrders() {
    return await prisma.order.findMany({
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            perfume: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to update order status:", error);
        return { success: false };
    }
}
export async function getAdminProducts() {
    return await prisma.perfume.findMany({
        include: {
            variants: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function updateProduct(id: string, data: {
    brand?: string;
    name?: string;
    category?: string;
    description?: string;
    mainImage?: string;
}) {
    try {
        await prisma.perfume.update({
            where: { id },
            data
        });
        revalidatePath("/admin");
        revalidatePath("/catalogo");
        revalidatePath(`/producto/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update product:", error);
        return { success: false };
    }
}

export async function updateVariant(id: string, data: {
    price?: number;
    stock?: number;
}) {
    try {
        const variant = await prisma.variant.update({
            where: { id },
            data: {
                ...data,
                stock: data.stock !== undefined ? Number(data.stock) : undefined
            }
        });
        revalidatePath("/admin");
        revalidatePath("/catalogo");
        revalidatePath(`/producto/${variant.perfumeId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update variant:", error);
        return { success: false };
    }
}

export async function createProduct(data: {
    brand: string;
    name: string;
    category: string;
    description: string;
    mainImage: string;
    gender: string;
    variants: {
        size: string;
        price: number;
        stock: number;
    }[];
}) {
    try {
        await prisma.perfume.create({
            data: {
                brand: data.brand,
                name: data.name,
                category: data.category,
                description: data.description,
                mainImage: data.mainImage,
                gender: data.gender,
                notes: "",
                images: "[]",
                variants: {
                    create: data.variants.map(v => ({
                        size: v.size,
                        price: v.price,
                        stock: v.stock
                    }))
                }
            }
        });
        revalidatePath("/admin");
        revalidatePath("/catalogo");
        return { success: true };
    } catch (error) {
        console.error("Failed to create product:", error);
        return { success: false };
    }
}
