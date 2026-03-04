"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cart, getTotalPrice, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle2 size={80} className="text-accent mb-8" strokeWidth={1} />
                <h1 className="text-4xl font-serif mb-4">¡Gracias por tu compra!</h1>
                <p className="text-muted font-sans tracking-wide mb-12 max-w-md">
                    Hemos recibido tu pedido y te hemos enviado un correo de confirmación. Tu fragancia llegará pronto.
                </p>
                <Link
                    href="/catalogo"
                    className="bg-black text-white px-10 py-5 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                >
                    Volver a la Tienda
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;

        setIsSubmitting(true);
        const result = await createOrder({
            customerName: formData.name,
            customerEmail: formData.email,
            total: getTotalPrice(),
            items: cart.map(item => ({
                variantId: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        });

        if (result.success) {
            setIsSuccess(true);
            clearCart();
        } else {
            alert("Hubo un error al procesar tu pedido. Inténtalo de nuevo.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted hover:text-black mb-12 transition-colors"
                >
                    <ChevronLeft size={14} />
                    Volver al catálogo
                </Link>

                <h1 className="text-4xl md:text-5xl font-serif mb-16">Finalizar Compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Form */}
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-accent mb-10">Información de Envío</h2>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-muted font-sans px-1">Nombre Completo</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Escribe tu nombre..."
                                    className="w-full bg-white border border-border px-6 py-4 text-sm font-sans focus:outline-none focus:border-black transition-colors"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-muted font-sans px-1">Correo Electrónico</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    className="w-full bg-white border border-border px-6 py-4 text-sm font-sans focus:outline-none focus:border-black transition-colors"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="pt-8">
                                <button
                                    disabled={isSubmitting || cart.length === 0}
                                    type="submit"
                                    className="w-full bg-black text-white py-6 text-sm uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Summary */}
                    <aside className="bg-card p-10 h-fit border border-border/50">
                        <h2 className="text-xs uppercase tracking-[0.3em] text-accent mb-10">Resumen del Pedido</h2>
                        <div className="space-y-6 mb-10">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-serif">{item.name}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-muted">
                                            {item.size} x {item.quantity}
                                        </span>
                                    </div>
                                    <span className="text-sm font-sans font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border pt-6 flex justify-between items-center">
                            <span className="text-xs uppercase tracking-[0.2em] font-sans">Total</span>
                            <span className="text-2xl font-serif">${getTotalPrice().toFixed(2)}</span>
                        </div>

                        <p className="mt-8 text-[10px] text-muted leading-relaxed font-sans text-center">
                            Al confirmar el pedido, aceptas nuestras condiciones de venta y política de privacidad.
                            El pago se realizará contra reembolso o transferencia bancaria según disponibilidad.
                        </p>
                    </aside>
                </div>
            </main>
        </div>
    );
}
