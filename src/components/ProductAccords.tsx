'use client';

import { useMemo } from 'react';

interface Accord {
    name: string;
    weight: number;
    color: string;
}

const defaultColors: Record<string, string> = {
    'cítrico': '#ffff00',
    'dulce': '#ef4444',
    'floral': '#fbbf24',
    'afrutados': '#f87171',
    'fresco especiado': '#a3e635',
    'ámbar': '#d97706',
    'amaderado': '#92400e',
    'aromático': '#5eead4',
    'atalcado': '#bfdbfe',
    'verde': '#22c55e',
    'fresco': '#7dd3fc',
    'especies': '#f97316',
    'animalico': '#78350f',
    'cuero': '#451a03',
    'vainilla': '#fde68a',
    'iris': '#c084fc',
    'rosa': '#fb7185',
    'pachulí': '#4d7c0f',
    'almizclado': '#e2e8f0',
    'aldehídico': '#e0f2fe',
    'floral amarillo': '#fde047',
    'terroso': '#78350f',
    'humo': '#4b5563',
    'metálico': '#94a3b8',
    'tabaco': '#7c2d12',
    'café': '#451a03',
};

export default function ProductAccords({ accordsString }: { accordsString: string }) {
    const accords = useMemo(() => {
        if (!accordsString || accordsString === '[]') return [];
        
        try {
            // Try parsing as JSON first
            if (accordsString.startsWith('[')) {
                return JSON.parse(accordsString) as Accord[];
            }
            
            // Otherwise parse as comma-separated string: "cítrico, dulce:80, floral"
            const items = accordsString.split(',').map(s => s.trim()).filter(Boolean);
            return items.map((item, index) => {
                const parts = item.split(':');
                const name = parts[0].trim();
                const weightStr = parts[1];
                
                const nameLower = name.toLowerCase();
                // If weight not provided, calculate a staggered weight from 100 to 50
                const weight = weightStr ? parseInt(weightStr) : (100 - (index * 8));
                
                return {
                    name: name,
                    weight: Math.max(40, Math.min(100, weight)),
                    color: defaultColors[nameLower] || '#94a3b8'
                };
            });
        } catch (e) {
            console.error("Failed to parse accords:", e);
            return [];
        }
    }, [accordsString]);

    if (accords.length === 0) return null;

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <h3 className="text-xs uppercase tracking-[0.3em] font-sans text-center mb-8 opacity-60">
                acordes principales
            </h3>
            
            <div className="flex flex-col items-center gap-1.5">
                {accords.map((accord, idx) => {
                    // Check if background is dark to determine text color
                    const isDark = !['#ffff00', '#fbbf24', '#fde047', '#bfdbfe', '#e0f2fe', '#fde68a', '#7dd3fc', '#5eead4', '#a3e635'].includes(accord.color.toLowerCase());
                    
                    return (
                        <div 
                            key={idx}
                            className="h-8 flex items-center justify-center transition-all duration-700 overflow-hidden relative group"
                            style={{ 
                                width: `${accord.weight}%`,
                                backgroundColor: accord.color,
                                color: isDark ? '#fff' : '#000',
                                borderTopRightRadius: '12px',
                                borderBottomRightRadius: '12px',
                                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
                            }}
                        >
                            <span className="text-[11px] font-sans font-medium uppercase tracking-widest px-4 truncate relative z-10">
                                {accord.name}
                            </span>
                            
                            {/* Hover effect highlight */}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    );
                })}
            </div>
            
            <div className="pt-8 flex justify-center">
                <button className="text-[9px] uppercase tracking-[0.2em] text-accent/80 border border-accent/20 bg-accent/5 px-6 py-2.5 hover:bg-accent hover:text-accent-foreground transition-all duration-500 rounded-full">
                    Buscar por acordes
                </button>
            </div>
        </div>
    );
}
