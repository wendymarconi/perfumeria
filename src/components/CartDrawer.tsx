"use client";

import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { formatPrice } from '@/lib/formatters';

export default function CartDrawer() {
    const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getTotalPrice } = useCart();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md">
                    <div className="h-full flex flex-col bg-background shadow-2xl border-l border-border/20">
                        {/* Header */}
                        <div className="px-6 py-8 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-serif">Tu Carrito</h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-white/5 text-muted rounded-full transition-colors"
                            >
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-8">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <ShoppingBag size={48} strokeWidth={1} className="text-muted/30 mb-6" />
                                    <p className="text-muted font-serif italic mb-8">Tu carrito está vacío</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-xs uppercase tracking-widest border-b border-accent pb-1 text-accent hover:text-white hover:border-white transition-all"
                                    >
                                        Seguir Comprando
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-24 h-32 bg-card flex-shrink-0 border border-border/10">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between mb-1">
                                                    <h3 className="font-serif text-lg text-foreground">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-[10px] uppercase tracking-widest text-muted hover:text-red-400 transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                                <p className="text-[10px] uppercase tracking-widest text-accent mb-4">
                                                    {item.brand} — {item.size}
                                                </p>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center border border-border/30">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-1 hover:bg-white/5 transition-colors text-foreground"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-sans text-foreground">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1 hover:bg-white/5 transition-colors text-foreground"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <span className="font-sans font-medium text-lg text-accent">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t border-border/20 bg-card">
                                <div className="flex justify-between mb-6">
                                    <span className="text-[10px] uppercase tracking-widest text-muted">Subtotal</span>
                                    <span className="text-xl font-serif text-accent">{formatPrice(getTotalPrice())}</span>
                                </div>
                                <Link
                                    href="/checkout"
                                    onClick={() => setIsCartOpen(false)}
                                    className="block w-full bg-accent text-accent-foreground text-center py-5 text-xs uppercase tracking-[0.2em] font-sans hover:bg-white hover:text-black transition-all premium-shadow"
                                >
                                    Finalizar Compra
                                </Link>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="block w-full text-center mt-6 text-[10px] uppercase tracking-widest text-muted hover:text-accent transition-colors"
                                >
                                    Continuar Comprando
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
