import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 scale-105"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1583523432317-17ade31089b7?auto=format&fit=crop&q=80&w=2000')",
                }}
            />
            <div className="absolute inset-0 bg-black/60 z-10" />

            {/* Content */}
            <div className="relative z-20 text-center text-white px-6 animate-fade-up">
                <span className="text-xs uppercase tracking-[0.4em] font-sans mb-6 block">Edición Limitada 2024</span>
                <h1 className="text-5xl md:text-8xl font-serif mb-8 leading-tight">
                    La Esencia de <br /> la Elegancia
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

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer">
                <div className="w-[1px] h-12 bg-white/50 relative">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white" />
                </div>
            </div>
        </section>
    );
}
