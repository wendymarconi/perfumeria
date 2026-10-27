import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const perfumeId = searchParams.get('perfumeId');
        const featured = searchParams.get('featured');

        if (perfumeId) {
            const reviews = await prisma.review.findMany({
                where: { perfumeId },
                orderBy: { createdAt: 'desc' },
            });
            return NextResponse.json(reviews);
        }

        if (featured === 'true') {
            // Testimonios destacados para la página de inicio
            const reviews = await prisma.review.findMany({
                where: {
                    rating: { gte: 4 },
                    comment: { not: null }
                },
                include: {
                    perfume: {
                        select: {
                            id: true,
                            name: true,
                            brand: true,
                            mainImage: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 8
            });
            return NextResponse.json(reviews);
        }

        // Todos los comentarios recientes
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error al obtener reseñas:", error);
        return NextResponse.json({ error: "Error al cargar reseñas." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { perfumeId, rating, comment, userName } = body;

        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Por favor selecciona una calificación entre 1 y 5 estrellas." }, { status: 400 });
        }

        const cleanUserName = typeof userName === 'string' && userName.trim().length > 0 
            ? userName.trim().slice(0, 50) 
            : "Cliente Verificado";

        const cleanComment = typeof comment === 'string' && comment.trim().length > 0
            ? comment.trim().slice(0, 1000)
            : null;

        const review = await prisma.review.create({
            data: {
                perfumeId: perfumeId || null,
                userName: cleanUserName,
                rating,
                comment: cleanComment,
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Error al crear la reseña:", error);
        return NextResponse.json({ error: "Ocurrió un error en el servidor." }, { status: 500 });
    }
}
