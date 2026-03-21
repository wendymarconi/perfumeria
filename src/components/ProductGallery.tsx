'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
    images: string[];
    name: string;
    category?: string;
}

export default function ProductGallery({ images, name, category }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextImage = () => {
        setActiveIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="flex flex-col md:flex-row gap-4 h-full">
            {/* Thumbnails (Left on desktop, bottom on mobile) */}
            <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[100px] md:max-h-full no-scrollbar">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                            "w-16 h-16 md:w-20 md:h-20 flex-shrink-0 relative border transition-all duration-300",
                            activeIndex === idx 
                                ? "border-accent ring-1 ring-accent scale-105" 
                                : "border-border/30 opacity-60 hover:opacity-100"
                        )}
                    >
                        <Image
                            src={img}
                            alt={`${name} thumbnail ${idx + 1}`}
                            fill
                            className="object-contain p-2 bg-white"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-grow aspect-[4/5] bg-white overflow-hidden group order-1 md:order-2 border border-border/10">
                <Image
                    src={images[activeIndex]}
                    alt={name}
                    fill
                    className="object-contain p-12 transition-transform duration-700"
                    priority
                />
                {/* Category Tag */}
                {category && (
                    <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-sans bg-background/60 border border-accent/30 text-accent px-3 py-1.5 glass z-20">
                        {category}
                    </span>
                )}
                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                {/* Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-background/60 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-widest font-sans border border-border/20">
                        {activeIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
}
