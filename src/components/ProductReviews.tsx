'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, Send, Sparkles } from 'lucide-react';

export interface ReviewItem {
    id: string;
    perfumeId?: string | null;
    userName?: string | null;
    rating: number;
    comment?: string | null;
    createdAt: string | Date;
}

interface ProductReviewsProps {
    perfumeId: string;
    initialReviews?: ReviewItem[];
}

export default function ProductReviews({ perfumeId, initialReviews = [] }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [userName, setUserName] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews)
        : 5;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    perfumeId,
                    rating,
                    userName: userName.trim() || 'Cliente Verificado',
                    comment: comment.trim() || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al guardar el comentario');
            }

            const newReview = await res.json();
            setReviews([newReview, ...reviews]);
            setSuccessMessage(true);
            setComment('');
            setUserName('');
            setIsOpenForm(false);

            setTimeout(() => {
                setSuccessMessage(false);
            }, 5000);
        } catch (err: any) {
            setErrorMessage(err.message || 'Hubo un problema al enviar tu comentario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const ratingDescriptions: Record<number, string> = {
        5: 'Excelente, fragancia fascinante',
        4: 'Muy buena, gran duración',
        3: 'Buena, cumple con lo esperado',
        2: 'Regular, esperaba otra nota',
        1: 'No fue de mi agrado',
    };

    return (
        <section id="reviews-section" className="mt-20 pt-16 border-t border-border/40 scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-accent font-sans mb-3 block flex items-center gap-2">
                        <Sparkles size={14} />
                        Opiniones de Clientes
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif">Reseñas y Experiencias</h2>
                </div>

                <button
                    onClick={() => setIsOpenForm(!isOpenForm)}
                    className="px-6 py-3.5 bg-foreground text-background text-xs uppercase tracking-widest font-sans hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2 rounded-none self-start md:self-auto"
                >
                    <MessageSquare size={14} />
                    {isOpenForm ? 'Cerrar Formulario' : 'Escribir una Opinión'}
                </button>
            </div>

            {/* Success alert */}
            {successMessage && (
                <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-sans flex items-center gap-3">
                    <CheckCircle2 size={16} />
                    <span>¡Muchas gracias! Tu opinión ha sido publicada exitosamente.</span>
                </div>
            )}

            {/* Review Form Drawer / Collapsible */}
            {isOpenForm && (
                <div className="mb-12 p-8 bg-card border border-border/60 rounded-none shadow-sm animate-in fade-in duration-300">
                    <h3 className="text-xl font-serif mb-2">Comparte tu experiencia con esta fragancia</h3>
                    <p className="text-xs text-muted mb-6">Tu opinión ayuda a otros amantes de la perfumería a elegir su fragancia ideal.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errorMessage && (
                            <p className="text-xs text-red-500 font-sans">{errorMessage}</p>
                        )}

                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-muted mb-2 font-sans">
                                Tu Calificación
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={24}
                                                strokeWidth={1}
                                                className={`transition-colors ${(hoverRating || rating) >= star
                                                    ? 'fill-accent text-accent'
                                                    : 'text-border hover:text-accent'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs text-muted font-sans italic">
                                    {ratingDescriptions[hoverRating || rating]}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-muted mb-2 font-sans">
                                    Tu Nombre o Iniciales
                                </label>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Ej. Valeria Gómez (Opcional)"
                                    className="w-full bg-background border border-border/40 p-3.5 text-sm focus:outline-none focus:border-accent text-foreground"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[11px] uppercase tracking-widest text-muted mb-2 font-sans">
                                    Tu Comentario u Opinión
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    placeholder="¿Qué te pareció el aroma, la fijación y la proyección en tu piel?"
                                    className="w-full bg-background border border-border/40 p-3.5 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsOpenForm(false)}
                                className="px-6 py-3 text-xs uppercase tracking-widest text-muted hover:text-foreground font-sans transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-sans font-medium hover:bg-black hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Send size={13} />
                                {isSubmitting ? 'Publicando...' : 'Publicar Opinión'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-card/60 border border-border/40 mb-12">
                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/40 pb-6 md:pb-0 md:pr-6">
                    <span className="text-5xl font-serif text-accent font-light">
                        {averageRating.toFixed(1)}
                    </span>
                    <div className="flex gap-1 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={16}
                                strokeWidth={1}
                                className={Math.round(averageRating) >= star ? 'fill-accent text-accent' : 'text-border'}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted font-sans">
                        Basado en {totalReviews} {totalReviews === 1 ? 'opinión' : 'opiniones'}
                    </span>
                </div>

                <div className="md:col-span-2 flex flex-col justify-center space-y-2">
                    {[5, 4, 3, 2, 1].map((starCount) => {
                        const count = reviews.filter((r) => r.rating === starCount).length;
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        return (
                            <div key={starCount} className="flex items-center gap-3 text-xs text-muted font-sans">
                                <span className="w-8 flex items-center gap-1 justify-end font-mono">
                                    {starCount} <Star size={11} className="fill-accent text-accent inline" />
                                </span>
                                <div className="flex-1 h-2 bg-background border border-border/30 overflow-hidden">
                                    <div
                                        className="h-full bg-accent transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="w-10 text-right font-mono text-[11px] opacity-70">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-16 px-6 border border-dashed border-border/60">
                    <MessageSquare size={36} className="mx-auto text-muted/60 mb-4 stroke-1" />
                    <h4 className="text-lg font-serif mb-2">Aún no hay opiniones para esta fragancia</h4>
                    <p className="text-xs text-muted max-w-md mx-auto mb-6">
                        ¿Has probado este perfume? Comparte tu experiencia con otros clientes y sé el primero en dejar una reseña.
                    </p>
                    <button
                        onClick={() => setIsOpenForm(true)}
                        className="px-6 py-3 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-sans hover:bg-black hover:text-white transition-all inline-flex items-center gap-2"
                    >
                        <Star size={13} />
                        Sé el Primero en Opinar
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((rev) => {
                        const dateObj = new Date(rev.createdAt);
                        const formattedDate = !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })
                            : 'Reciente';

                        return (
                            <div
                                key={rev.id}
                                className="p-6 md:p-8 bg-card/40 border border-border/30 hover:border-accent/40 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-serif font-bold text-sm">
                                            {(rev.userName || 'C').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-serif font-medium text-sm text-foreground">
                                                    {rev.userName || 'Cliente Verificado'}
                                                </h4>
                                                <span className="inline-flex items-center gap-1 text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-sans uppercase tracking-wider">
                                                    <CheckCircle2 size={10} />
                                                    Verificado
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-muted font-sans block mt-0.5">
                                                {formattedDate}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={14}
                                                strokeWidth={1}
                                                className={rev.rating >= star ? 'fill-accent text-accent' : 'text-border'}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {rev.comment && (
                                    <p className="text-sm font-sans text-foreground/90 leading-relaxed font-light pl-0 sm:pl-12">
                                        "{rev.comment}"
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
