"use client";

import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { formatPrice } from '@/lib/formatters';
import { useWishlist } from "@/context/WishlistContext";

export default function ProductCard({ perfume }: { perfume: any }) {
    const prices = perfume.variants.map((v: any) => v.price).filter((p: number) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isWished = isInWishlist(perfume.id);

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(perfume.id);
    };

    return (
        <Link href={`/producto/${perfume.id}`} className="group block">
            <div className="aspect-[3/4] overflow-hidden bg-white relative mb-5 p-4 border border-border/5 group-hover:border-accent/20 transition-all duration-500">
                <Image
                    src={perfume.mainImage}
                    alt={perfume.name}
                    fill
                    className="object-contain transition-all duration-1000 group-hover:scale-110 px-4 py-8"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end justify-center pb-6">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-accent backdrop-blur-sm px-4 py-1.5 border border-accent/20">
                        Ver Detalle
                    </span>
                </div>

                {/* Gender Tag */}
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                    <span className="bg-background/90 backdrop-blur-sm border border-border/10 px-2 py-1 text-[8px] uppercase tracking-[0.2em] font-medium text-foreground/80">
                        {perfume.gender === 'Male' ? 'Hombre' : perfume.gender === 'Female' ? 'Mujer' : 'Unisex'}
                    </span>
                    <span className="bg-accent/10 backdrop-blur-sm border border-accent/20 px-2 py-0.5 text-[7px] uppercase tracking-[0.3em] font-bold text-accent">
                        {perfume.category}
                    </span>
                </div>

                {/* Wishlist Button */}
                <button 
                    onClick={handleWishlist}
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 hover:bg-white hover:border-white transition-all duration-300 z-10 group/wish"
                >
                    <Heart 
                        size={15} 
                        className={`transition-all duration-300 ${isWished ? "fill-rose-500 text-rose-500" : "text-muted group-hover/wish:text-accent"}`} 
                    />
                </button>
            </div>

            <div className="flex flex-col gap-1.5 text-center px-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-accent/70 font-sans">{perfume.brand}</span>
                <h3 className="text-sm md:text-md font-serif text-foreground group-hover:text-accent transition-colors duration-300 lines-clamp-1">{perfume.name}</h3>
                <div className="flex items-center justify-center pt-2 gap-4">
                    <div className="h-[1px] w-4 bg-border/40 group-hover:w-8 transition-all" />
                    <p className="text-xs text-muted font-sans tracking-widest uppercase">
                        Desde <span className="text-foreground font-medium ml-1">{formatPrice(minPrice)}</span>
                    </p>
                    <div className="h-[1px] w-4 bg-border/40 group-hover:w-8 transition-all" />
                </div>
            </div>
        </Link>
    );
}
