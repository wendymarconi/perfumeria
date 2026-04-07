"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;


export async function adminLogin(email: string, password: string) {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@perfumeria.com';
        const adminPassword = process.env.ADMIN_PASSWORD || process.env.CONTRASEÑA_DE_ADMINISTRADOR;

        if (!adminPassword) {
            console.error('ADMIN_PASSWORD (o CONTRASEÑA_DE_ADMINISTRADOR) no está configurada.');
            return { success: false, error: 'Error de configuración: Contraseña no definida en Vercel.' };
        }

        if (email === adminEmail && password === adminPassword) {
            return { success: true };
        }

        console.warn(`Intento de login fallido para: ${email}`);
        return { success: false, error: 'Email o contraseña incorrectos.' };
    } catch (error) {
        console.error('adminLogin error crítico:', error);
        return { success: false, error: 'Error interno en el servidor.' };
    }
}

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
                statusHistory: {
                    create: {
                        status: "PENDING"
                    }
                }
            },
        });

        // Enviar notificación por Correo Electrónico usando Resend
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@perfumeria.com';
            
            if (resend) {
                // Recuperamos la orden con los nombres de los productos
                const orderWithItems = await prisma.order.findUnique({
                    where: { id: order.id },
                    include: {
                        items: {
                            include: {
                                variant: {
                                    include: { perfume: true }
                                }
                            }
                        }
                    }
                });
                
                if (orderWithItems) {
                    let htmlMessage = `
                        <h2>🛒 ¡NUEVO PEDIDO RECIBIDO!</h2>
                        <hr />
                        <p><strong>👤 Cliente:</strong> ${data.customerName}</p>
                        <p><strong>📧 Email:</strong> ${data.customerEmail}</p>
                        <h3>🛍️ Productos:</h3>
                        <ul>
                    `;
                    
                    orderWithItems.items.forEach(item => {
                        htmlMessage += `<li>${item.quantity}x ${item.variant.perfume.name} (${item.variant.size}) - $${Number(item.quantity) * Number(item.price)}</li>`;
                    });
                    
                    htmlMessage += `
                        </ul>
                        <br />
                        <h3>💰 TOTAL: $${data.total}</h3>
                        <p><small>Este pedido está ahora pendiente en tu panel de administrador.</small></p>
                    `;

                    await resend.emails.send({
                        from: 'Soporte Perfumeria <onboarding@resend.dev>',
                        to: [adminEmail],
                        subject: `Nuevo pedido de ${data.customerName} - $${data.total}`,
                        html: htmlMessage
                    });
                }
            } else {
                 console.warn("Falta RESEND_API_KEY para enviar el correo");
            }
        } catch (error) {
            console.error("Error al enviar notificación de correo:", error);
        }

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
            },
            statusHistory: {
                orderBy: {
                    createdAt: 'desc'
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
            data: { 
                status,
                statusHistory: {
                    create: { status }
                }
            }
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

export async function getAdminProductIds() {
    return await prisma.perfume.findMany({
        select: {
            id: true,
            name: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function getAdminProductById(id: string) {
    return await prisma.perfume.findUnique({
        where: { id },
        include: {
            variants: true
        }
    });
}

export async function updateProduct(id: string, data: {
    brand?: string;
    name?: string;
    gender?: string;
    category?: string;
    description?: string;
    mainImage?: string;
    images?: string;
    notes?: string;
    accords?: string;
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

export async function getPerfumesByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];
    return await prisma.perfume.findMany({
        where: { id: { in: ids } },
        include: { variants: true }
    });
}

export async function deleteProduct(id: string) {
    try {
        await prisma.perfume.delete({
            where: { id }
        });
        revalidatePath("/admin");
        revalidatePath("/catalogo");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false };
    }
}

export async function updateVariant(id: string, data: {
    size?: string;
    price?: number;
    stock?: number;
}) {
    try {
        const variant = await prisma.variant.update({
            where: { id },
            data: {
                ...data,
                stock: data.stock !== undefined ? Number(data.stock) : undefined,
                price: data.price !== undefined ? Number(data.price) : undefined
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

export async function createVariant(perfumeId: string, data: {
    size: string;
    price: number;
    stock: number;
}) {
    try {
        await prisma.variant.create({
            data: {
                ...data,
                perfumeId
            }
        });
        revalidatePath("/admin");
        revalidatePath("/catalogo");
        revalidatePath(`/producto/${perfumeId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to create variant:", error);
        return { success: false };
    }
}

export async function deleteVariant(id: string) {
    try {
        const variant = await prisma.variant.delete({
            where: { id }
        });
        revalidatePath("/admin");
        revalidatePath("/catalogo");
        revalidatePath(`/producto/${variant.perfumeId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete variant:", error);
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
    notes?: string;
    images?: string;
    accords?: string;
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
                notes: data.notes || "",
                accords: data.accords || "[]",
                images: data.images || "[]",
                variants: {
                    create: data.variants.map(v => ({
                        size: v.size,
                        price: Number(v.price),
                        stock: Number(v.stock)
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

// NUEVAS ACCIONES: Autenticación, Variantes y Carrusel

// loginAdmin: alias de adminLogin para compatibilidad con código anterior
export async function loginAdmin(email: string, password: string) {
    return adminLogin(email, password);
}


export async function addVariant(perfumeId: string, data: { size: string, price: number, stock: number }) {
    try {
        await prisma.variant.create({
            data: {
                ...data,
                perfumeId
            }
        });
        revalidatePath("/admin");
        revalidatePath("/catalogo");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function getCarouselImages() {
    return await prisma.homeCarousel.findMany({
        orderBy: { order: 'asc' }
    });
}

export async function updateCarouselImage(id: string | null, data: { imageUrl: string, title?: string, subtitle?: string, order: number }) {
    try {
        if (id) {
            await prisma.homeCarousel.update({
                where: { id },
                data
            });
        } else {
            await prisma.homeCarousel.create({
                data
            });
        }
        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteCarouselImage(id: string) {
    try {
        await prisma.homeCarousel.delete({ where: { id } });
        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
