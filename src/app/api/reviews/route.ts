import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { perfumeId, rating, comment } = body;

        if (!perfumeId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Datos inválidos para la calificación." }, { status: 400 });
        }

        const review = await prisma.review.create({
            data: {
                perfumeId,
                rating,
                comment,
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Error al crear la reseña:", error);
        return NextResponse.json({ error: "Ocurrió un error en el servidor." }, { status: 500 });
    }
}
