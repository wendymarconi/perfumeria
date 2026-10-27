'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2, Sparkles, Send, X, Quote } from 'lucide-react';

interface Testimonial {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    tag?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    {
        id: 't-1',
        userName: 'Valentina Restrepo',
        rating: 5,
        comment: 'La fijación de los perfumes es increíble, me duró todo el día en la piel y la ropa. Además, la asesoría por WhatsApp para elegir mi fragancia fue impecable.',
        date: 'Hace 4 días',
        tag: 'Baccarat Rouge 540'
    },
    {
        id: 't-2',
        userName: 'Carlos Andrés M.',
        rating: 5,
        comment: 'Compré por primera vez con un poco de duda, pero la calidad superó mis expectativas al 100%. Llegó muy rápido y perfectamente empacado.',
        date: 'Hace 1 semana',
        tag: 'Sauvage Elixir'
    },
    {
        id: 't-3',
        userName: 'Camila Montoya',
        rating: 5,
        comment: 'Amo la presentación y la proyección del aroma. Todo el mundo en mi oficina me preguntó qué perfume llevaba puesto. ¡Totalmente recomendados!',
        date: 'Hace 2 semanas',
        tag: 'Delina Exclusif'
    },
    {
        id: 't-4',
        userName: 'David Giraldo',
        rating: 5,
        comment: 'Excelente experiencia de compra. El pedido se coordinó por WhatsApp en minutos y al día siguiente ya lo tenía en mi puerta.',
        date: 'Hace 3 semanas',
        tag: 'Aventus Creed'
    }
];

export default function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [userName, setUserName] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function loadFeaturedReviews() {
            try {
                const res = await fetch('/api/reviews?featured=true');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const dynamicTestimonials: Testimonial[] = data.map((item: any) => ({
                            id: item.id,
                            userName: item.userName || 'Cliente Verificado',
                            rating: item.rating,
                            comment: item.comment,
                            date: new Date(item.createdAt).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short'
                            }),
                            tag: item.perfume?.name || 'Cliente Verificado'
                        }));
                        // Mezclar los dinámicos con los por defecto para asegurar variedad
                        setTestimonials([...dynamicTestimonials, ...DEFAULT_TESTIMONIALS].slice(0, 6));
                    }
                }
            } catch (err) {
                // Silenciosamente usar los por defecto si hay fallo de conexión
            }
        }
        loadFeaturedReviews();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            setErrorMessage('Por favor cuéntanos un breve comentario sobre tu experiencia.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    perfumeId: null, // Testimonio general de la tienda
                    rating,
                    userName: userName.trim() || 'Cliente Verificado',
                    comment: comment.trim(),
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al enviar tu opinión');
            }

            const newRev = await res.json();
            const newTestimonial: Testimonial = {
                id: newRev.id,
                userName: newRev.userName || 'Cliente Verificado',
                rating: newRev.rating,
                comment: newRev.comment,
                date: 'Recién publicado',
                tag: 'Experiencia Verificada'
            };

            setTestimonials([newTestimonial, ...testimonials]);
            setSuccessMessage(true);
            setComment('');
            setUserName('');
            
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccessMessage(false);
            }, 2500);
        } catch (err: any) {
            setErrorMessage(err.message || 'Ocurrió un error al guardar tu comentario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 md:py-32 bg-background border-t border-border/30">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-xs uppercase tracking-[0.3em] text-accent font-sans mb-3 block flex items-center gap-2">
                            <Sparkles size={14} />
                            Experiencias Reales
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                            Lo Que Dicen Quienes Nos Eligen
                        </h2>
                        <p className="text-sm font-sans text-muted mt-3 font-light leading-relaxed">
                            Opiniones de clientes satisfechos con la fijación, exclusividad y rapidez en nuestras entregas.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-sans font-medium hover:bg-black hover:text-white transition-all flex items-center gap-2 w-fit shadow-sm"
                    >
                        <MessageSquare size={14} />
                        Dejar mi Opinión
                    </button>
                </div>

                {/* Testimonial Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {testimonials.map((t) => (
                        <div
                            key={t.id}
                            className="p-8 bg-card border border-border/40 hover:border-accent/60 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={14}
                                                strokeWidth={1}
                                                className={t.rating >= star ? 'fill-accent text-accent' : 'text-border'}
                                            />
                                        ))}
                                    </div>
                                    <Quote size={20} className="text-accent/30 group-hover:text-accent/60 transition-colors" />
                                </div>

                                <p className="text-sm font-sans text-foreground/90 leading-relaxed font-light mb-6 italic">
                                    "{t.comment}"
                                </p>
                            </div>

                            <div className="pt-6 border-t border-border/20">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-serif font-medium text-sm text-foreground">
                                        {t.userName}
                                    </h4>
                                    <span className="text-[10px] text-muted font-sans font-mono">
                                        {t.date}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <CheckCircle2 size={11} className="text-accent" />
                                    <span className="text-[10px] uppercase tracking-wider text-accent font-sans">
                                        {t.tag || 'Cliente Verificado'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para dejar reseña general */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-card border border-border p-8 md:p-10 max-w-lg w-full relative shadow-2xl">
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setSuccessMessage(false);
                                setErrorMessage('');
                            }}
                            className="absolute top-6 right-6 text-muted hover:text-foreground transition-colors p-1"
                            aria-label="Cerrar ventana"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-sans block mb-2">
                                Tu Opinión Importa
                            </span>
                            <h3 className="text-2xl font-serif">Déjanos tu Comentario</h3>
                            <p className="text-xs text-muted mt-1 leading-relaxed">
                                Comparte cómo fue tu experiencia de compra o qué te parecieron nuestras fragancias.
                            </p>
                        </div>

                        {successMessage ? (
                            <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/30 my-6">
                                <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-3" />
                                <h4 className="text-base font-serif mb-1 text-emerald-600 dark:text-emerald-400">
                                    ¡Comentario recibido!
                                </h4>
                                <p className="text-xs text-muted">
                                    Muchas gracias por compartir tu experiencia con toda la comunidad.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {errorMessage && (
                                    <p className="text-xs text-red-500 font-sans">{errorMessage}</p>
                                )}

                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest text-muted mb-2 font-sans">
                                        Tu Calificación
                                    </label>
                                    <div className="flex gap-1.5">
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
                                                    size={26}
                                                    strokeWidth={1}
                                                    className={`transition-colors ${(hoverRating || rating) >= star
                                                        ? 'fill-accent text-accent'
                                                        : 'text-border hover:text-accent'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest text-muted mb-2 font-sans">
                                        Tu Nombre o Iniciales
                                    </label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Ej. Andrés Ramírez"
                                        className="w-full bg-background border border-border/40 p-3.5 text-sm focus:outline-none focus:border-accent text-foreground"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest text-muted mb-2 font-sans">
                                        Tu Experiencia / Comentario
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                        required
                                        placeholder="Cuéntanos sobre el aroma, la fijación, la atención o el envío..."
                                        className="w-full bg-background border border-border/40 p-3.5 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
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
                                        {isSubmitting ? 'Enviando...' : 'Publicar Opinión'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
