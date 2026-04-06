"use client";

import Link from "next/link";
import { ShoppingBag, User, Search, X, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
    const { getTotalItems, setIsCartOpen } = useCart();
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
                        <img src="/logo-paradiso.png" alt="Paradiso Logo" className="h-12 w-12 object-contain rounded-full border border-accent/20" />
                        <div className="flex flex-col">
                            <span className="text-xl font-serif tracking-[0.2em] leading-none text-accent">
                                PARADISO
                            </span>
                            <span className="text-[7px] uppercase tracking-[0.3em] mt-1 opacity-60 font-sans group-hover:opacity-100 transition-opacity">
                                Universo Fragántico
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-10 text-sm font-sans tracking-widest uppercase">
                        <Link href="/catalogo" className="hover:text-accent transition-colors">Catálogo</Link>
                        <Link href="/catalogo?gender=Male" className="hover:text-accent transition-colors">Hombre</Link>
                        <Link href="/catalogo?gender=Female" className="hover:text-accent transition-colors">Mujer</Link>
                        <Link href="/catalogo?category=Nicho" className="hover:text-accent transition-colors">Nicho</Link>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-6">
                        {isSearching ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value.trim() === '') {
                                            router.push('/catalogo');
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (searchQuery.trim()) {
                                                router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
                                            }
                                            setIsSearching(false);
                                        }
                                    }}
                                    className="bg-transparent border-b border-accent focus:outline-none text-sm w-32 md:w-48 text-foreground"
                                    placeholder="Buscar perfume..."
                                />
                                <button className="hover:text-accent transition-colors" onClick={() => {
                                    setSearchQuery('');
                                    router.push('/catalogo');
                                    setIsSearching(false);
                                }}>
                                    <X size={18} strokeWidth={1.5} />
                                </button>
                            </div>
                        ) : (
                            <button className="hover:text-accent transition-colors" title="Search" onClick={() => setIsSearching(true)}>
                                <Search size={22} strokeWidth={1.5} />
                            </button>
                        )}
                        <Link href="/wishlist" className="hover:text-accent transition-colors" title="Favoritos">
                            <Heart size={22} strokeWidth={1.5} />
                        </Link>
                        <Link href="/admin" className="hover:text-accent transition-colors" title="Admin">
                            <User size={22} strokeWidth={1.5} />
                        </Link>
                        <button
                            className="relative hover:text-accent transition-colors"
                            title="Cart"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingBag size={22} strokeWidth={1.5} />
                            <span className="absolute -top-1 -right-1 bg-accent text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center">
                                {getTotalItems()}
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
            <CartDrawer />
        </>
    );
}
