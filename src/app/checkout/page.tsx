"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { createOrder, getStoreSettings } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronLeft, Landmark, Smartphone, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/formatters';

export default function CheckoutPage() {
    const { cart, getTotalPrice, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        receiverName: '',
        notes: '',
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
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            receiverName: formData.receiverName || formData.name,
            notes: formData.notes,
            total: getTotalPrice(),
            items: cart.map(item => ({
                variantId: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        });

        if (result.success) {
            // Obtener el número de WhatsApp configurado dinámicamente
            const settingsRes = await getStoreSettings();
            const phoneNumber = settingsRes.success && settingsRes.settings 
                ? settingsRes.settings.whatsappNumber 
                : "573216743586";

            const message = `¡Hola! Acabo de registrar un nuevo pedido en la tienda.

*Detalles del Cliente:*
Nombre: ${formData.name}
Email: ${formData.email}
Celular: ${formData.phone}

*Detalles de Envío:*
Dirección: ${formData.address}
Ciudad: ${formData.city}
Recibe: ${formData.receiverName || formData.name}
${formData.notes ? `Observaciones: ${formData.notes}` : ''}

*Resumen del Pedido:*
${cart.map(item => `- ${item.quantity}x ${item.name} (${item.size}) - ${formatPrice(item.price * item.quantity)}`).join('\n')}

*Total:* ${formatPrice(getTotalPrice())}

Por favor confírmame el pedido para coordinar el pago. ¡Gracias!`;

            const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(waLink, '_blank');

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-muted font-sans px-1">Celular / WhatsApp</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="310 123 4567"
                                        className="w-full bg-white border border-border px-6 py-4 text-sm font-sans focus:outline-none focus:border-black transition-colors"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-muted font-sans px-1">Ciudad</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Bogotá, Medellín, etc."
                                        className="w-full bg-white border border-border px-6 py-4 text-sm font-sans focus:outline-none focus:border-black transition-colors"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-muted font-sans px-1">Dirección de Envío</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Calle, Carrera, Apto, Barrio..."
                                    className="w-full bg-white border border-border px-6 py-4 text-sm font-sans focus:outline-none focus:border-black transition-colors"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-muted font-sans px-1">¿Quién recibe el pedido? (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Si es para otra persona, escribe su nombre"
                                    className="w-full bg-white border border-border px-6 py-4 text-sm font-sans focus:outline-none focus:border-black transition-colors"
                                    value={formData.receiverName}
                                    onChange={e => setFormData({ ...formData, receiverName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-muted font-sans px-1">Observaciones (Opcional)</label>
                                <textarea
                                    placeholder="Instrucciones especiales para el repartidor o detalles adicionales..."
                                    rows={3}
                                    className="w-full bg-white border border-border px-6 py-4 text-sm font-sans focus:outline-none focus:border-black transition-colors resize-none"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
                                    <span className="text-sm font-sans font-medium">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border pt-6 flex justify-between items-center">
                            <span className="text-xs uppercase tracking-[0.2em] font-sans">Total</span>
                            <span className="text-2xl font-serif">{formatPrice(getTotalPrice())}</span>
                        </div>

                        <div className="mt-10 border-t border-border pt-8">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent mb-6 text-center">Medios de Pago Aceptados</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background/50 border border-border/30 p-4 flex flex-col items-center justify-center text-center gap-3 group hover:border-[#FDDA24]/50 transition-colors duration-300">
                                    <div className="h-8 flex items-center">
                                        <svg width="40" height="40" viewBox="0 0 100 100" className="opacity-80 group-hover:opacity-100 transition-opacity">
                                            <rect x="10" y="30" width="80" height="15" fill="#FDDA24" />
                                            <rect x="10" y="45" width="80" height="15" fill="#003893" />
                                            <rect x="10" y="60" width="80" height="10" fill="#CE1126" />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] uppercase tracking-widest font-bold">Bancolombia</span>
                                </div>
                                <div className="bg-background/50 border border-border/30 p-4 flex flex-col items-center justify-center text-center gap-3 group hover:border-[#ED1C24]/50 transition-colors duration-300">
                                    <div className="h-8 flex items-center">
                                        <svg width="35" height="35" viewBox="0 0 100 100" className="opacity-80 group-hover:opacity-100 transition-opacity">
                                            <rect rx="15" x="10" y="10" width="80" height="80" fill="#ED1C24" />
                                            <rect rx="2" x="35" y="25" width="30" height="50" fill="white" />
                                            <circle cx="50" cy="70" r="3" fill="#ED1C24" />
                                        </svg>
                                    </div>
                                    <span className="text-[9px] uppercase tracking-widest font-bold">Daviplata</span>
                                </div>
                                <div className="bg-background/50 border border-border/30 p-4 flex flex-col items-center justify-center text-center gap-3 group hover:border-[#004481]/50 transition-colors duration-300">
                                    <div className="h-8 flex items-center">
                                        <span className="text-xl font-black text-[#004481] italic tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">BBVA</span>
                                    </div>
                                    <span className="text-[9px] uppercase tracking-widest font-bold">Transferencia</span>
                                </div>
                                <div className="bg-background/50 border border-border/30 p-4 flex flex-col items-center justify-center text-center gap-3 group hover:border-emerald-500/50 transition-colors duration-300 relative overflow-hidden">
                                    <div className="h-8 flex items-center">
                                        <Truck size={24} className="text-muted group-hover:text-emerald-500 transition-colors duration-300" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] uppercase tracking-widest font-bold">Contraentrega</span>
                                        <span className="text-[7px] uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 mt-1 border border-emerald-500/20">Solo Bogotá</span>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-6 text-[9px] text-muted leading-relaxed font-sans text-center">
                                El pago se coordinará de forma segura vía WhatsApp una vez confirmado tu pedido. Al confirmar, aceptas nuestras condiciones de venta y política de privacidad.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
