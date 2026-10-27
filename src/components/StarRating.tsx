'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    perfumeId?: string;
    initialRating?: number;
    totalReviews?: number;
}

export default function StarRating({ initialRating = 0, totalReviews = 0 }: StarRatingProps) {
    const scrollToReviews = () => {
        const el = document.getElementById('reviews-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div 
            onClick={scrollToReviews}
            className="flex items-center gap-3 my-4 cursor-pointer group w-fit"
            title="Ver opiniones de clientes"
        >
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = Math.round(initialRating || 5) >= star;
                    return (
                        <div key={star} className="p-0.5">
                            <Star
                                size={16}
                                strokeWidth={isFilled ? 0 : 1.5}
                                className={`transition-colors ${
                                    isFilled 
                                        ? 'fill-accent text-accent' 
                                        : 'text-muted group-hover:text-accent'
                                }`}
                            />
                        </div>
                    );
                })}
            </div>
            <span className="text-xs text-muted font-sans tracking-wide group-hover:text-foreground transition-colors underline decoration-border/60 underline-offset-4">
                {totalReviews > 0
                    ? `${initialRating.toFixed(1)} / 5.0 (${totalReviews} ${totalReviews === 1 ? 'opinión' : 'opiniones'})`
                    : '5.0 / 5.0 (Sé el primero en opinar)'}
            </span>
        </div>
    );
}
