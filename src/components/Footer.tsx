"use client";

import React from 'react';
import Image from 'next/image';

const paymentMethods = [
    { name: 'Bancolombia', logo: '/logo-bancolombia.jpg', width: 130, height: 40 },
    { name: 'Daviplata', logo: '/logo-daviplata.jpg', width: 110, height: 40 },
    { name: 'BBVA', logo: '/logo-bbva.png', width: 100, height: 40 },
    { name: 'Contra Entrega', logo: '/logo-contraentrega.jpg', width: 60, height: 50 },
];

export default function Footer() {
    return (
        <footer className="bg-card border-t border-border/20 py-16 px-6">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12">

                {/* Redes Sociales */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-accent mb-2">Síguenos en:</span>
                    <a
                        href="https://www.instagram.com/perfumeriaparadiso/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-transform duration-300 hover:scale-110"
                    >
                        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
                                    <stop offset="0%" stopColor="#fdf497" />
                                    <stop offset="5%" stopColor="#fdf497" />
                                    <stop offset="45%" stopColor="#fd5949" />
                                    <stop offset="60%" stopColor="#d6249f" />
                                    <stop offset="90%" stopColor="#285AEB" />
                                </radialGradient>
                            </defs>
                            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ig-gradient)" />
                            <rect x="6" y="6" width="36" height="36" rx="9" stroke="white" strokeWidth="3" fill="none" />
                            <circle cx="24" cy="24" r="9" stroke="white" strokeWidth="3" fill="none" />
                            <circle cx="35" cy="13" r="2.5" fill="white" />
                        </svg>
                    </a>
                </div>

                {/* Métodos de Pago */}
                <div className="flex flex-col items-center gap-8 w-full">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-accent">Métodos de pago aceptados:</span>

                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                        {paymentMethods.map((method) => (
                            <div key={method.name} className="flex flex-col items-center gap-3 transition-opacity hover:opacity-100 opacity-80">
                                <div className="h-[50px] flex items-center justify-center">
                                    <Image
                                        src={method.logo}
                                        alt={`Logo ${method.name}`}
                                        width={method.width}
                                        height={method.height}
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-[8px] uppercase tracking-widest font-bold">{method.name}</span>
                            </div>
                        ))}
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
