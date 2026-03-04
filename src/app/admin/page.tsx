"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Clock, CheckCircle2, Truck, XCircle, ChevronRight, Package, ShoppingCart, Edit2, Save, Trash2, Camera } from 'lucide-react';
import { getOrders, updateOrderStatus, getAdminProducts, updateProduct, updateVariant, createProduct } from '@/lib/actions';
import { formatPrice } from '@/lib/formatters';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'create'>('orders');
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [newProductData, setNewProductData] = useState<any>({
        brand: '',
        name: '',
        category: 'Nicho',
        description: '',
        mainImage: '',
        gender: 'Unisex',
        variants: [
            { size: '5ml', price: 0, stock: 10 },
            { size: '10ml', price: 0, stock: 10 },
            { size: '100ml', price: 0, stock: 5 }
        ]
    });

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'inventory') {
            fetchProducts();
        }
    }, [activeTab]);

    async function fetchOrders() {
        setIsLoading(true);
        const data = await getOrders();
        setOrders(data);
        setIsLoading(false);
    }

    async function fetchProducts() {
        setIsLoading(true);
        const data = await getAdminProducts();
        setProducts(data);
        setIsLoading(false);
    }

    async function handleStatusChange(orderId: string, newStatus: string) {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
            fetchOrders();
        }
    }

    async function handleUpdateProduct(id: string) {
        const result = await updateProduct(id, {
            name: editData.name,
            brand: editData.brand,
            description: editData.description,
            mainImage: editData.mainImage,
        });

        if (result.success) {
            setEditingProduct(null);
            fetchProducts();
        }
    }

    async function handleUpdateVariant(variantId: string, field: 'price' | 'stock', value: number) {
        const result = await updateVariant(variantId, { [field]: Number(value) });
        if (result.success) {
            fetchProducts();
        }
    }

    async function handleCreateProduct() {
        setIsLoading(true);
        const result = await createProduct(newProductData);
        if (result.success) {
            setActiveTab('inventory');
            setNewProductData({
                brand: '', name: '', category: 'Nicho', description: '', mainImage: '', gender: 'Unisex',
                variants: [
                    { size: '5ml', price: 0, stock: 10 },
                    { size: '10ml', price: 0, stock: 10 },
                    { size: '100ml', price: 0, stock: 5 }
                ]
            });
        }
        setIsLoading(false);
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} className="text-amber-500" />;
            case 'SHIPPED': return <Truck size={16} className="text-blue-500" />;
            case 'DELIVERED': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'CANCELLED': return <XCircle size={16} className="text-rose-500" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-accent mb-4 block">Panel de Control</span>
                        <h1 className="text-4xl md:text-5xl font-serif text-foreground">Administración</h1>
                    </div>

                    <div className="flex bg-card/50 p-1 border border-border/20 glass backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-2.5 text-[10px] uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'}`}
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingCart size={14} />
                                <span>Pedidos</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-6 py-2.5 text-[10px] uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Package size={14} />
                                <span>Inventario</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-6 py-2.5 text-[10px] uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Save size={14} />
                                <span>Nuevo</span>
                            </div>
                        </button>
                    </div>
                </header>

                {isLoading ? (
                    <div className="py-24 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full mb-4"></div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">Sincronizando datos...</p>
                    </div>
                ) : activeTab === 'orders' ? (
                    /* ORDERS TAB */
                    orders.length === 0 ? (
                        <div className="py-24 border border-dashed border-border/30 text-center glass">
                            <p className="text-muted font-serif italic text-lg">No hay pedidos registrados aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-card border border-border/20 overflow-hidden hover:border-accent/40 transition-all duration-500 group">
                                    <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
                                        <div className="lg:w-48">
                                            <span className="text-[10px] uppercase tracking-widest text-accent/70 block mb-1">Referencia</span>
                                            <span className="text-sm font-sans font-medium block mb-3 text-foreground">#{order.id.slice(-6).toUpperCase()}</span>
                                            <span className="text-[10px] text-muted block uppercase tracking-widest">
                                                {new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="lg:flex-grow">
                                            <span className="text-[10px] uppercase tracking-widest text-accent/70 block mb-1">Cliente</span>
                                            <span className="text-sm font-serif block text-lg mb-1 text-foreground">{order.customerName}</span>
                                            <span className="text-[10px] font-sans text-muted uppercase tracking-widest">{order.customerEmail}</span>
                                        </div>

                                        <div className="lg:w-64">
                                            <span className="text-[10px] uppercase tracking-widest text-accent/70 block mb-1">Resumen</span>
                                            <p className="text-xs font-sans text-muted">
                                                {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'} — <span className="text-accent font-medium">{formatPrice(order.total)}</span>
                                            </p>
                                        </div>

                                        <div className="flex flex-col lg:items-end gap-4 min-w-[200px]">
                                            <div className="flex items-center gap-2 bg-background/50 border border-border/10 px-3 py-1.5 rounded-sm">
                                                {getStatusIcon(order.status)}
                                                <span className="text-[10px] uppercase tracking-widest font-semibold text-foreground">{order.status}</span>
                                            </div>

                                            <select
                                                defaultValue={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="w-full text-[10px] uppercase tracking-widest bg-background border border-border/30 px-3 py-2.5 text-foreground focus:outline-none focus:border-accent cursor-pointer transition-colors"
                                            >
                                                <option value="PENDING">Pendiente</option>
                                                <option value="SHIPPED">Enviado</option>
                                                <option value="DELIVERED">Entregado</option>
                                                <option value="CANCELLED">Cancelado</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-background/20 px-8 py-4 border-t border-border/10 flex items-center justify-between">
                                        <div className="flex flex-wrap gap-4">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="text-[9px] uppercase tracking-widest text-muted border border-border/10 px-2 py-1 bg-background/30">
                                                    {item.variant.perfume.name} • {item.variant.size} × {item.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === 'inventory' ? (
                    /* INVENTORY TAB */
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {products.map((product) => (
                            <div key={product.id} className="bg-card border border-border/20 p-8 hover:border-accent/40 transition-all duration-500">
                                {editingProduct === product.id ? (
                                    /* Edit Mode */
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-accent">Marca</label>
                                                <input
                                                    type="text"
                                                    value={editData.brand}
                                                    onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                                                    className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-accent">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-accent">Descripción</label>
                                            <textarea
                                                rows={4}
                                                value={editData.description}
                                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-accent">URL Imagen Principal</label>
                                            <input
                                                type="text"
                                                value={editData.mainImage}
                                                onChange={(e) => setEditData({ ...editData, mainImage: e.target.value })}
                                                className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-4 pt-4 border-t border-border/10">
                                            <button
                                                onClick={() => setEditingProduct(null)}
                                                className="px-6 py-2 text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleUpdateProduct(product.id)}
                                                className="bg-accent text-accent-foreground px-8 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                                            >
                                                <Save size={14} />
                                                <span>Guardar Cambios</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* View Mode */
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="w-32 h-44 bg-background border border-border/10 flex-shrink-0 group overflow-hidden relative">
                                            <img
                                                src={product.mainImage}
                                                alt={product.name}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera size={20} className="text-accent" />
                                            </div>
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-widest text-accent mb-1 block">{product.brand}</span>
                                                    <h3 className="text-xl font-serif text-foreground">{product.name}</h3>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(product.id);
                                                        setEditData(product);
                                                    }}
                                                    className="p-2 text-muted hover:text-accent transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>

                                            <p className="text-sm text-muted font-sans line-clamp-2 italic mb-6">
                                                "{product.description}"
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/5 pt-6">
                                                {product.variants.map((variant: any) => (
                                                    <div key={variant.id} className="bg-background/40 p-3 border border-border/10">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[10px] uppercase tracking-widest text-muted">{variant.size}</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[9px] text-muted">Stock:</span>
                                                                <input
                                                                    type="number"
                                                                    defaultValue={variant.stock}
                                                                    onBlur={(e) => handleUpdateVariant(variant.id, 'stock', parseInt(e.target.value))}
                                                                    className="w-12 bg-transparent border-none p-0 text-[10px] focus:outline-none focus:ring-0 text-foreground text-right"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-sans text-accent">$</span>
                                                            <input
                                                                type="number"
                                                                defaultValue={variant.price}
                                                                onBlur={(e) => handleUpdateVariant(variant.id, 'price', parseFloat(e.target.value))}
                                                                className="w-full bg-transparent border-none p-0 text-sm font-medium focus:outline-none focus:ring-0 text-foreground"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* CREATE TAB */
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-card border border-border/20 p-10 glass">
                            <h2 className="text-2xl font-serif text-foreground mb-8 text-center italic">Nuevo Perfume</h2>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-accent">Marca</label>
                                        <input
                                            type="text"
                                            placeholder="ej: Parfums de Marly"
                                            value={newProductData.brand}
                                            onChange={(e) => setNewProductData({ ...newProductData, brand: e.target.value })}
                                            className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-accent">Nombre</label>
                                        <input
                                            type="text"
                                            placeholder="ej: Layton"
                                            value={newProductData.name}
                                            onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                                            className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-accent">Categoría</label>
                                        <select
                                            value={newProductData.category}
                                            onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                                            className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground"
                                        >
                                            <option value="Nicho">Nicho</option>
                                            <option value="Árabe">Árabe</option>
                                            <option value="Diseñador">Diseñador</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-accent">Género</label>
                                        <select
                                            value={newProductData.gender}
                                            onChange={(e) => setNewProductData({ ...newProductData, gender: e.target.value })}
                                            className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground"
                                        >
                                            <option value="Unisex">Unisex</option>
                                            <option value="Male">Hombre</option>
                                            <option value="Female">Mujer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-accent">Descripción</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe la fragancia..."
                                        value={newProductData.description}
                                        onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                                        className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="text-[10px] uppercase tracking-widest text-accent">URL Imagen Principal</label>
                                        <span className="text-[9px] text-muted italic">Tip: Click derecho &gt; Copiar dirección de imagen</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="https://ejemplo.com/foto.jpg"
                                        value={newProductData.mainImage}
                                        onChange={(e) => setNewProductData({ ...newProductData, mainImage: e.target.value })}
                                        className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground"
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/10">
                                    <label className="text-[10px] uppercase tracking-widest text-accent block text-center">Configuración de Tamaños & Stock</label>

                                    <div className="space-y-3">
                                        {newProductData.variants.map((variant: any, idx: number) => (
                                            <div key={idx} className="grid grid-cols-3 gap-4 items-center bg-background/30 p-4 border border-border/5">
                                                <div className="text-xs uppercase tracking-widest text-muted">{variant.size}</div>
                                                <div className="flex items-center gap-2 border-b border-border/50 pb-1">
                                                    <span className="text-xs text-accent">$</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Precio"
                                                        value={variant.price || ''}
                                                        onChange={(e) => {
                                                            const newVariants = [...newProductData.variants];
                                                            newVariants[idx].price = Number(e.target.value);
                                                            setNewProductData({ ...newProductData, variants: newVariants });
                                                        }}
                                                        className="w-full bg-transparent border-none p-0 text-sm focus:outline-none focus:ring-0 text-foreground"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 border-b border-border/50 pb-1">
                                                    <span className="text-[9px] text-muted font-sans italic">Unds:</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Stock"
                                                        value={variant.stock || ''}
                                                        onChange={(e) => {
                                                            const newVariants = [...newProductData.variants];
                                                            newVariants[idx].stock = Number(e.target.value);
                                                            setNewProductData({ ...newProductData, variants: newVariants });
                                                        }}
                                                        className="w-full bg-transparent border-none p-0 text-sm focus:outline-none focus:ring-0 text-foreground"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button
                                        onClick={handleCreateProduct}
                                        className="w-full bg-accent text-accent-foreground py-4 text-xs uppercase tracking-[0.3em] font-medium hover:bg-white hover:text-black transition-all group overflow-hidden relative"
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <Save size={16} />
                                            <span>Guardar Nuevo Perfume</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
