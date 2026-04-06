"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/context/WishlistContext';
import { getPerfumesByIds } from '@/lib/actions';
import FadeIn from '@/components/FadeIn';
import { HeartCrack } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
    const { wishlist } = useWishlist();
    const [perfumes, setPerfumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWishlist() {
            if (wishlist.length > 0) {
                const data = await getPerfumesByIds(wishlist);
                setPerfumes(data);
            } else {
                setPerfumes([]);
            }
            setLoading(false);
        }
        fetchWishlist();
    }, [wishlist]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-6 py-32">
                <FadeIn direction="up">
                    <h1 className="text-4xl md:text-5xl font-serif mb-4">Lista de Deseos</h1>
                    <p className="text-muted font-sans text-sm tracking-widest uppercase mb-16">
                        Tus fragancias favoritas seleccionadas
                    </p>
                </FadeIn>

                {loading ? (
                    <div className="flex justify-center py-20 text-muted">Cargando favoritos...</div>
                ) : perfumes.length === 0 ? (
                    <FadeIn delay={0.2} className="flex flex-col items-center justify-center py-32 text-center bg-card border border-border/30">
                        <HeartCrack size={48} strokeWidth={1} className="text-muted/50 mb-6" />
                        <h2 className="text-2xl font-serif mb-4">Aún no tienes favoritos</h2>
                        <p className="text-muted font-sans text-sm max-w-sm mb-8">
                            Navega por nuestro catálogo y haz clic en el corazón para guardar los perfumes que más te gusten.
                        </p>
                        <Link 
                            href="/catalogo"
                            className="bg-black text-white px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                        >
                            Explorar Catálogo
                        </Link>
                    </FadeIn>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {perfumes.map((perfume, idx) => (
                            <FadeIn key={perfume.id} delay={0.1 * idx}>
                                <div className="relative group">
                                    <ProductCard perfume={perfume} />
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
