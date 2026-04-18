"use client";

import React from 'react';
import { Instagram, Truck } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-card border-t border-border/20 py-16 px-6">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12">
                
                {/* Redes Sociales */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-accent mb-2">Síguenos en:</span>
                    <a 
                        href="https://instagram.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-background border border-border/30 rounded-full hover:border-accent hover:text-accent transition-all duration-300 group"
                    >
                        <Instagram size={24} strokeWidth={1.5} />
                    </a>
                </div>

                {/* Métodos de Pago */}
                <div className="flex flex-col items-center gap-8 w-full">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-accent">Métodos de pago aceptados:</span>
                    
                    <div className="flex flex-wrap justify-center gap-6 md:gap-10 opacity-70">
                        {/* Bancolombia */}
                        <div className="flex flex-col items-center gap-2">
                            <svg width="40" height="30" viewBox="0 0 100 100">
                                <rect x="10" y="30" width="80" height="15" fill="#FDDA24" />
                                <rect x="10" y="45" width="80" height="15" fill="#003893" />
                                <rect x="10" y="60" width="80" height="10" fill="#CE1126" />
                            </svg>
                            <span className="text-[8px] uppercase tracking-widest font-bold">Bancolombia</span>
                        </div>

                        {/* Daviplata */}
                        <div className="flex flex-col items-center gap-2">
                            <svg width="35" height="30" viewBox="0 0 100 100">
                                <rect rx="10" x="10" y="10" width="80" height="80" fill="#ED1C24" />
                                <rect rx="2" x="35" y="25" width="30" height="50" fill="white" />
                                <circle cx="50" cy="70" r="3" fill="#ED1C24" />
                            </svg>
                            <span className="text-[8px] uppercase tracking-widest font-bold">Daviplata</span>
                        </div>

                        {/* BBVA */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-[30px] flex items-center">
                                <span className="text-lg font-black text-[#004481] italic tracking-tighter">BBVA</span>
                            </div>
                            <span className="text-[8px] uppercase tracking-widest font-bold">Transferencia</span>
                        </div>

                        {/* Contraentrega */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-[30px] flex items-center">
                                <Truck size={24} strokeWidth={1.5} className="text-muted" />
                            </div>
                            <span className="text-[8px] uppercase tracking-widest font-bold">Contraentrega</span>
                        </div>
                    </div>
                </div>

                {/* Copyright/Footer Info */}
                <div className="pt-8 border-t border-border/10 w-full">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted">
                        &copy; {new Date().getFullYear()} Perfumería Paradiso. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
