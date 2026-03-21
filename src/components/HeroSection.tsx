import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden bg-background">
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-card to-background opacity-50" />
            
            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-up">
                <span className="text-xs md:text-sm uppercase tracking-[0.4em] text-accent font-sans mb-8">
                    La Esencia de la Elegancia
                </span>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light mb-8 leading-tight tracking-tight">
                    Descubre Tu<br />
                    <span className="italic font-normal">Sello Personal</span>
                </h1>
                
                <p className="text-lg md:text-xl font-sans text-foreground/70 mb-12 max-w-2xl font-light tracking-wide leading-relaxed">
                    Nuestra colección de fragancias exclusivas está diseñada para evocar emociones, recuerdos y una presencia inolvidable.
                </p>
                
                <Link href="/catalogo" className="group relative inline-flex items-center justify-center px-12 py-5 bg-foreground text-background font-sans text-xs uppercase tracking-[0.2em] transition-all hover:bg-accent">
                    Explorar Colección
                </Link>
            </div>
            
            {/* Decorative minimalist elements */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-b from-accent to-transparent" />
        </section>
    );
}
