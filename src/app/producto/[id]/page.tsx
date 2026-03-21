import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import ProductActions from "@/components/ProductActions";
import ProductGallery from "@/components/ProductGallery";
import ProductAccords from "@/components/ProductAccords";

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const perfume = await prisma.perfume.findUnique({
        where: { id },
        include: {
            variants: {
                orderBy: {
                    price: "asc",
                },
            },
        },
    });

    if (!perfume) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32">
                {/* Back Link */}
                <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors mb-12 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al Catálogo
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Product Images */}
                    <div className="flex flex-col gap-12">
                        <div className="relative">
                            <ProductGallery 
                                images={(() => {
                                    try {
                                        const parsed = JSON.parse(perfume.images || '[]');
                                        return parsed.length > 0 ? parsed : [perfume.mainImage];
                                    } catch {
                                        return [perfume.mainImage];
                                    }
                                })()} 
                                name={perfume.name} 
                                category={perfume.category}
                            />
                        </div>

                        {/* Accords Section (Desktop only here, or integrated) */}
                        <div className="hidden lg:block pt-8 border-t border-border/10">
                            <ProductAccords accordsString={perfume.accords || ''} />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-10">
                            <span className="text-xs uppercase tracking-[0.4em] text-accent font-sans mb-4 block">
                                {perfume.brand}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-serif mb-6">{perfume.name}</h1>
                            <p className="text-sm uppercase tracking-widest text-muted mb-8">
                                Fragancia {perfume.gender === "Male" ? "Masculina" : perfume.gender === "Female" ? "Femenina" : "Unisex"}
                            </p>
                            <p className="text-lg font-sans font-light leading-relaxed text-foreground/80 mb-10">
                                {perfume.description}
                            </p>

                            {/* Accords Section (Mobile only here) */}
                            <div className="lg:hidden mb-12">
                                <ProductAccords accordsString={perfume.accords || ''} />
                            </div>
                        </div>

                        {/* Olfactory Notes */}
                        <div className="bg-card p-8 mb-10 border border-border/50">
                            <h3 className="text-xs uppercase tracking-widest font-sans mb-6 opacity-50">
                                Notas Olfativas
                            </h3>
                            <div className="space-y-5">
                                {perfume.notes.split(";").map((note, index) => {
                                    const colonIndex = note.indexOf(":");
                                    const title = colonIndex !== -1 ? note.substring(0, colonIndex) : note;
                                    const content = colonIndex !== -1 ? note.substring(colonIndex + 1) : '';
                                    return (
                                        <div key={index} className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-widest text-accent font-bold">
                                                {title.trim()}
                                            </span>
                                            <span className="text-sm font-sans italic opacity-80 leading-relaxed break-words">
                                                {content.trim()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Product Actions (Variants & Add to Cart) */}
                        <ProductActions product={perfume} />

                        {/* Extra Info */}
                        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-border pt-12">
                            <div className="flex items-start gap-4">
                                <Truck className="text-accent" size={24} strokeWidth={1.5} />
                                <div>
                                    <h4 className="text-[11px] uppercase tracking-widest font-sans mb-1">Envío Express</h4>
                                    <p className="text-[10px] text-muted leading-relaxed">Entrega garantizada en 24/48 horas para toda la península.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <ShieldCheck className="text-accent" size={24} strokeWidth={1.5} />
                                <div>
                                    <h4 className="text-[11px] uppercase tracking-widest font-sans mb-1">Garantía Aura</h4>
                                    <p className="text-[10px] text-muted leading-relaxed">Todos nuestros productos son 100% originales y sellados.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
