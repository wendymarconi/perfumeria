import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPrice } from '@/lib/formatters';

export default function ProductCard({ perfume }: { perfume: any }) {
    const prices = perfume.variants.map((v: any) => v.price).filter((p: number) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    return (
        <Link href={`/producto/${perfume.id}`} className="group block">
            <div className="aspect-[3/4] overflow-hidden bg-muted relative mb-6">
                <Image
                    src={perfume.mainImage}
                    alt={perfume.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                {/* Gender Tag */}
                <span className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-2 py-1 text-[8px] uppercase tracking-widest">
                    {perfume.gender === 'Male' ? 'Hombre' : perfume.gender === 'Female' ? 'Mujer' : perfume.gender}
                </span>
            </div>

            <div className="flex flex-col gap-1 text-center sm:text-left px-1">
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37]/80 block">{perfume.brand}</span>
                <h3 className="text-base font-serif text-foreground group-hover:text-[#D4AF37] transition-colors">{perfume.name}</h3>
                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted font-sans">
                        Precio <span className="text-foreground font-medium">{formatPrice(minPrice)}</span>
                    </p>
                    <ArrowRight size={14} className="text-[#D4AF37] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500" />
                </div>
            </div>
        </Link>
    );
}
