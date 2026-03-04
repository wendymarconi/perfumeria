"use client";

import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatters';

interface Variant {
    id: string;
    size: string;
    price: number;
    stock: number; // Changed from boolean to number
}

interface Product {
    id: string;
    name: string;
    brand: string;
    mainImage: string;
    variants: Variant[];
}

export default function ProductActions({ product }: { product: Product }) {
    const [selectedVariant, setSelectedVariant] = useState<Variant>(
        product.variants.find(v => v.stock > 0) || product.variants[0]
    );
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart({
            id: selectedVariant.id,
            perfumeId: product.id,
            name: product.name,
            brand: product.brand,
            size: selectedVariant.size,
            price: selectedVariant.price,
            image: product.mainImage,
            quantity: 1
        });
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Variants / Sizes */}
            <div className="mb-2">
                <h3 className="text-xs uppercase tracking-widest font-sans mb-6 opacity-50">
                    Selecciona Tamaño
                </h3>
                <div className="flex flex-wrap gap-4">
                    {product.variants.map((variant) => (
                        <button
                            key={variant.id}
                            disabled={variant.stock <= 0}
                            onClick={() => setSelectedVariant(variant)}
                            className={`px-8 py-4 border text-xs tracking-widest uppercase font-sans transition-all flex flex-col items-center gap-1 ${selectedVariant.id === variant.id
                                ? "border-accent bg-accent text-accent-foreground"
                                : variant.stock > 0
                                    ? "border-border hover:border-accent cursor-pointer bg-card text-foreground"
                                    : "border-border/30 opacity-40 cursor-not-allowed bg-background"
                                }`}
                        >
                            <span>{variant.size}</span>
                            <span className={`text-[10px] font-medium ${selectedVariant.id === variant.id ? "text-accent-foreground/80" : "text-muted"}`}>
                                {formatPrice(variant.price)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={handleAddToCart}
                disabled={selectedVariant.stock <= 0}
                className="w-full bg-accent text-accent-foreground py-6 text-sm uppercase tracking-[0.2em] font-sans hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-4 premium-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ShoppingBag size={20} />
                {selectedVariant.stock > 0 ? "Añadir a la Bolsa" : "Sin Stock"}
            </button>
        </div>
    );
}
