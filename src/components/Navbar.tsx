"use client";

import Link from "next/link";
import { ShoppingBag, User, Search, X, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
    const { getTotalItems, setIsCartOpen } = useCart();
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                isScrolled 
                ? "h-16 bg-background/80 backdrop-blur-xl border-b border-border/40" 
                : "h-24 bg-transparent"
            }`}>
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group transition-all duration-500">
                        <div className="relative">
                            <img 
                                src="/logo-paradiso.png" 
                                alt="Paradiso Logo" 
                                className={`object-contain rounded-full border border-accent/20 transition-all duration-500 ${
                                    isScrolled ? "h-10 w-10" : "h-14 w-14"
                                }`} 
                            />
                            <div className="absolute inset-0 bg-accent/5 rounded-full animate-pulse -z-10" />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-serif tracking-[0.25em] leading-none text-accent transition-all duration-500 ${
                                isScrolled ? "text-lg" : "text-2xl"
                            }`}>
                                PARADISO
                            </span>
                            <span className="text-[7px] uppercase tracking-[0.4em] mt-1.5 opacity-50 font-sans group-hover:opacity-100 group-hover:text-accent transition-all">
                                Universo Fragántico
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-12 text-[10px] font-sans tracking-[0.3em] uppercase">
                        {['Catalogo', 'Hombre', 'Mujer', 'Nicho'].map((item) => (
                            <Link 
                                key={item}
                                href={item === 'Catalogo' ? '/catalogo' : `/catalogo?${item === 'Nicho' ? 'category=Nicho' : `gender=${item === 'Hombre' ? 'Male' : 'Female'}`}`} 
                                className="relative group overflow-hidden py-1"
                            >
                                <span className="group-hover:text-accent transition-colors duration-300">{item === 'Catalogo' ? 'Catálogo' : item}</span>
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-7">
                        <div className="flex items-center">
                            {isSearching ? (
                                <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
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
                                        className="bg-transparent border-b border-accent/40 focus:border-accent focus:outline-none text-xs w-36 md:w-56 text-foreground pb-1"
                                        placeholder="Buscar fragancia..."
                                    />
                                    <button 
                                        className="text-muted hover:text-rose-500 transition-colors" 
                                        onClick={() => {
                                            setSearchQuery('');
                                            setIsSearching(false);
                                        }}
                                    >
                                        <X size={16} strokeWidth={1.5} />
                                    </button>
                                </div>
                            ) : (
                                <button className="hover:text-accent transition-all duration-300 hover:scale-110" title="Search" onClick={() => setIsSearching(true)}>
                                    <Search size={20} strokeWidth={1.2} />
                                </button>
                            )}
                        </div>

                        <Link href="/wishlist" className="hover:text-accent transition-all duration-300 hover:scale-110 relative group" title="Favoritos">
                            <Heart size={20} strokeWidth={1.2} />
                            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <Link href="/admin" className="hover:text-accent transition-all duration-300 hover:scale-110" title="Admin">
                            <User size={20} strokeWidth={1.2} />
                        </Link>

                        <button
                            className="relative hover:text-accent transition-all duration-300 hover:scale-110 group"
                            title="Cart"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingBag size={20} strokeWidth={1.2} />
                            <span className="absolute -top-1.5 -right-1.5 bg-accent text-[9px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-background group-hover:scale-110 transition-transform">
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
