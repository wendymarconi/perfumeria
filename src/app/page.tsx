import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { getCarouselImages } from "@/lib/actions";

export default async function Home() {
  const featuredPerfumes = await prisma.perfume.findMany({
    take: 4,
    include: {
      variants: {
        orderBy: {
          price: 'asc'
        }
      }
    }
  });

  const carouselImages = await getCarouselImages();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <HeroCarousel images={carouselImages} />

        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-[0.3em] text-accent font-sans mb-4 block">Selección Exclusiva</span>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight">Nuestros Perfumes Destacados</h2>
            </div>
            <button className="text-sm uppercase tracking-widest font-sans border-b border-black pb-1 hover:text-accent hover:border-accent transition-all">
              Ver Todo el Catálogo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {featuredPerfumes.map((perfume: any) => (
              <ProductCard
                key={perfume.id}
                perfume={perfume}
              />
            ))}
          </div>
        </section>

        {/* Brand Philosophy / Quote */}
        <section className="bg-card py-24 md:py-32 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h3 className="text-2xl md:text-3xl font-serif italic mb-8 leading-relaxed">
              "El perfume es la forma más intensa del recuerdo. Debe ser una revelación, no una decoración."
            </h3>
            <div className="w-12 h-[1px] bg-accent mx-auto mb-6" />
            <span className="text-xs uppercase tracking-widest font-sans opacity-60">Paradiso Signature Collection</span>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 text-center">
        <p className="text-xs uppercase tracking-[0.2em] opacity-50 font-sans">
          &copy; {new Date().getFullYear()} Paradiso Universo Fragántico. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
