"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CarouselImage {
    id: string;
    imageUrl: string;
    title?: string | null;
    subtitle?: string | null;
}

export default function HeroCarousel({ images }: { images: CarouselImage[] }) {
    const [current, setCurrent] = useState(0);

    // Default image if no images are provided
    const defaultImages = [
        {
            id: 'default-1',
            imageUrl: "https://images.unsplash.com/photo-1583523432317-17ade31089b7?auto=format&fit=crop&q=80&w=2000",
            title: "La Esencia de la Elegancia",
            subtitle: "Edición Limitada 2024"
        }
    ];

    const displayImages = images.length > 0 ? images : defaultImages;

    useEffect(() => {
        if (displayImages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % displayImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [displayImages.length]);

    const next = () => setCurrent((prev) => (prev + 1) % displayImages.length);
    const prev = () => setCurrent((prev) => (prev - 1 + displayImages.length) % displayImages.length);

    return (
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Carousel Images */}
            {displayImages.map((img, idx) => (
                <div
                    key={img.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? "opacity-100" : "opacity-0"}`}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-10000 scale-110"
                        style={{ backgroundImage: `url('${img.imageUrl}')` }}
                    />
                    <div className="absolute inset-0 bg-black/50 z-10" />
                </div>
            ))}

            {/* Content */}
            <div className="relative z-20 text-center text-white px-6">
                <div className="animate-fade-up">
                    <span className="text-xs uppercase tracking-[0.4em] font-sans mb-6 block">
                        {displayImages[current]?.subtitle || "Explora lo Exclusivo"}
                    </span>
                    <h1 className="text-5xl md:text-8xl font-serif mb-8 leading-tight">
                        {displayImages[current]?.title || "La Esencia de la Elegancia"}
                    </h1>
                    <p className="max-w-xl mx-auto text-lg md:text-xl font-sans font-light mb-12 opacity-90 leading-relaxed">
                        Explora nuestra selección curada de las fragancias más exclusivas del mundo.
                        Diseñadas para quienes no temen destacar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/catalogo" className="px-10 py-5 bg-accent text-accent-foreground text-sm uppercase tracking-widest font-sans hover:bg-white hover:text-black transition-all duration-500 premium-shadow text-center">
                            Ver Catálogo
                        </Link>
                        <button className="px-10 py-5 bg-transparent border border-accent/40 text-accent text-sm uppercase tracking-widest font-sans hover:bg-accent/10 transition-all duration-500 flex items-center gap-3">
                            Explorar Nicho <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Controls */}
            {displayImages.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-6 z-30 p-2 text-white/50 hover:text-white transition-colors">
                        <ChevronLeft size={32} />
                    </button>
                    <button onClick={next} className="absolute right-6 z-30 p-2 text-white/50 hover:text-white transition-colors">
                        <ChevronRight size={32} />
                    </button>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                        {displayImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === current ? "bg-accent w-6" : "bg-white/30"}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer md:block hidden">
                <div className="w-[1px] h-12 bg-white/50 relative">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white" />
                </div>
            </div>
        </section>
    );
}
