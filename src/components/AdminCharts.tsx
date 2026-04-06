"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AdminCharts({ orders, products }: { orders: any[], products: any[] }) {
    // 1. Revenue by Order Status
    const revenueByStatus = orders.reduce((acc, order) => {
        const stat = order.status;
        if (!acc[stat]) acc[stat] = 0;
        acc[stat] += order.total;
        return acc;
    }, {} as Record<string, number>);

    const statusData = Object.keys(revenueByStatus).map(key => ({
        name: key,
        total: revenueByStatus[key]
    }));

    // 2. Inventory by Category
    const categoryCount = products.reduce((acc, product) => {
        const cat = product.category;
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += 1;
        return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.keys(categoryCount).map(key => ({
        name: key,
        value: categoryCount[key]
    }));

    const COLORS = ['#D4AF37', '#0F171A', '#64748B', '#B8860B'];

    // Total Revenue (Delivered only or All)
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const completedRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats Cards */}
                <div className="bg-card border border-border/20 p-6 glass flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-muted block mb-2">Ingresos Totales (Generados)</span>
                    <span className="text-4xl font-serif text-accent">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="bg-card border border-border/20 p-6 glass flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-muted block mb-2">Ingresos Completados (Entregados)</span>
                    <span className="text-4xl font-serif text-emerald-600">${completedRevenue.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: Revenue by Status */}
                <div className="bg-card border border-border/20 p-6 glass">
                    <h3 className="text-xs uppercase tracking-widest text-muted mb-6">Ingresos por Estado</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" fontSize={10} tickMargin={10} />
                                <YAxis fontSize={10} tickFormatter={(val) => `$${val}`} />
                                <Tooltip formatter={(val) => [`$${val}`, 'Ingresos']} />
                                <Bar dataKey="total" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Inventory Distribution */}
                <div className="bg-card border border-border/20 p-6 glass">
                    <h3 className="text-xs uppercase tracking-widest text-muted mb-6">Productos por Categoría</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4">
                            {categoryData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name} ({entry.value})
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
