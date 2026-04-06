"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
    wishlist: string[];
    toggleWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('perfume_wishlist');
        if (saved) {
            try {
                setWishlist(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse wishlist', e);
            }
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('perfume_wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, mounted]);

    const toggleWishlist = (id: string) => {
        setWishlist(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const isInWishlist = (id: string) => wishlist.includes(id);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
