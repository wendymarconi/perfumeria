'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    perfumeId: string;
    initialRating?: number;
    totalReviews?: number;
}

export default function StarRating({ perfumeId, initialRating = 0, totalReviews = 0 }: StarRatingProps) {
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [reviewsCount, setReviewsCount] = useState(totalReviews);

    const handleRating = async (value: number) => {
        if (hasVoted) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ perfumeId, rating: value }),
            });

            if (res.ok) {
                setHasVoted(true);
                const newTotal = reviewsCount + 1;
                const newRating = reviewsCount === 0 ? value : ((rating * reviewsCount) + value) / newTotal;
                setRating(newRating);
                setReviewsCount(newTotal);
                alert("¡Gracias por tu calificación!");
            } else {
                alert("Hubo un error al calificar. Inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error al enviar calificación", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center gap-3 my-4">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hover || Math.round(rating)) >= star;
                    return (
                        <button
                            key={star}
                            type="button"
                            disabled={submitting || hasVoted}
                            onClick={() => handleRating(star)}
                            onMouseEnter={() => !hasVoted && setHover(star)}
                            onMouseLeave={() => !hasVoted && setHover(0)}
                            className={`p-1 transition-all ${submitting || hasVoted
                                    ? 'cursor-default'
                                    : 'cursor-pointer hover:scale-110'
                                }`}
                            aria-label={`Calificar con ${star} estrellas`}
                        >
                            <Star
                                size={18}
                                strokeWidth={isFilled ? 0 : 1.5}
                                className={`transition-colors ${isFilled ? 'fill-accent text-accent' : 'text-muted hover:text-accent'
                                    }`}
                            />
                        </button>
                    );
                })}
            </div>
            <span className="text-xs text-muted font-sans tracking-wide">
                {reviewsCount > 0
                    ? `${rating.toFixed(1)} / 5.0 (${reviewsCount} ${reviewsCount === 1 ? 'opinión' : 'opiniones'})`
                    : 'Sé el primero en calificar'}
            </span>
        </div>
    );
}
