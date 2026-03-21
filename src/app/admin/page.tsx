"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Clock, CheckCircle2, Truck, XCircle, ChevronRight, Package, ShoppingCart, Edit2, Save, Trash2, Camera, Upload, Image as ImageIcon, Plus, Trash, PlusCircle, MinusCircle } from 'lucide-react';
import { getOrders, updateOrderStatus, getAdminProducts, updateProduct, updateVariant, createProduct, deleteProduct, createVariant, deleteVariant } from '@/lib/actions';
import { formatPrice } from '@/lib/formatters';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'create'>('orders');
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const editFileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Filtros de Pedidos
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const statusTranslations: Record<string, string> = {
        'PENDING': 'Pendiente',
        'SHIPPED': 'Despachado',
        'DELIVERED': 'Entregado',
        'RETURNED': 'Devuelto',
        'CANCELLED': 'Cancelado',
    };

    const [newProductData, setNewProductData] = useState<any>({
        brand: '',
        name: '',
        category: 'Nicho',
        description: '',
        mainImage: '',
        images: '[]',
        accords: '',
        gender: 'Unisex',
        variants: [
            { size: '5ml', price: 0, stock: 10 }
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
            notes: editData.notes,
            accords: editData.accords,
            mainImage: editData.mainImage,
            images: editData.images
        });

        if (result.success) {
            setEditingProduct(null);
            fetchProducts();
        }
    }

    async function handleDeleteProduct(id: string) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            const result = await deleteProduct(id);
            if (result.success) {
                fetchProducts();
            }
        }
    }

    async function handleUpdateVariant(variantId: string, field: 'size' | 'price' | 'stock', value: any) {
        const result = await updateVariant(variantId, { [field]: field === 'size' ? value : Number(value) });
        if (result.success) {
            fetchProducts();
        }
    }

    async function handleAddVariant(productId: string) {
        const result = await createVariant(productId, { size: 'Nueva Medida', price: 0, stock: 0 });
        if (result.success) {
            fetchProducts();
        }
    }

    async function handleDeleteVariant(variantId: string) {
        if (confirm('¿Eliminar esta medida?')) {
            const result = await deleteVariant(variantId);
            if (result.success) {
                fetchProducts();
            }
        }
    }

    async function handleCreateProduct() {
        if (!newProductData.mainImage) {
            alert('Por favor, selecciona una imagen o introduce una URL.');
            return;
        }
        setIsLoading(true);
        const result = await createProduct(newProductData);
        if (result.success) {
            setActiveTab('inventory');
            setNewProductData({
                brand: '', name: '', category: 'Nicho', description: '', mainImage: '', gender: 'Unisex',
                images: '[]', accords: '',
                variants: [
                    { size: '5ml', price: 0, stock: 10 },
                    { size: '10ml', price: 0, stock: 10 },
                    { size: '100ml', price: 0, stock: 5 }
                ]
            });
        }
        setIsLoading(false);
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen es demasiado grande. Por favor usa una imagen de menos de 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            if (isEdit) {
                const currentImages = JSON.parse(editData.images || '[]');
                if (index !== undefined) {
                    currentImages[index] = base64String;
                } else if (currentImages.length < 5) {
                    currentImages.push(base64String);
                }
                const mainImg = currentImages[0] || '';
                setEditData({ ...editData, images: JSON.stringify(currentImages), mainImage: mainImg });
            } else {
                const currentImages = JSON.parse(newProductData.images || '[]');
                if (index !== undefined) {
                    currentImages[index] = base64String;
                } else if (currentImages.length < 5) {
                    currentImages.push(base64String);
                }
                const mainImg = currentImages[0] || '';
                setNewProductData({ ...newProductData, images: JSON.stringify(currentImages), mainImage: mainImg });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (index: number, isEdit: boolean = false) => {
        if (isEdit) {
            const currentImages = JSON.parse(editData.images || '[]');
            currentImages.splice(index, 1);
            const mainImg = currentImages[0] || '';
            setEditData({ ...editData, images: JSON.stringify(currentImages), mainImage: mainImg });
        } else {
            const currentImages = JSON.parse(newProductData.images || '[]');
            currentImages.splice(index, 1);
            const mainImg = currentImages[0] || '';
            setNewProductData({ ...newProductData, images: JSON.stringify(currentImages), mainImage: mainImg });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} className="text-amber-500" />;
            case 'SHIPPED': return <Truck size={16} className="text-blue-500" />;
            case 'DELIVERED': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'RETURNED': return <XCircle size={16} className="text-rose-500" />;
            case 'CANCELLED': return <XCircle size={16} className="text-gray-500" />;
            default: return <Clock size={16} className="text-gray-500" />;
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
                            {/* Filter Section */}
                            <div className="bg-card/50 p-6 border border-border/20 mb-8 flex flex-col sm:flex-row gap-6">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase tracking-widest text-accent mb-2 block font-medium">Filtrar por Estado</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full bg-background border border-border/30 p-3 text-xs focus:outline-none focus:border-accent text-foreground transition-colors cursor-pointer"
                                    >
                                        <option value="ALL">Mostrar Todos</option>
                                        <option value="PENDING">Pendientes</option>
                                        <option value="SHIPPED">Despachados</option>
                                        <option value="DELIVERED">Entregados</option>
                                        <option value="RETURNED">Devueltos</option>
                                        <option value="CANCELLED">Cancelados</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase tracking-widest text-accent mb-2 block font-medium">Fecha Desde</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-background border border-border/30 p-3 text-xs focus:outline-none focus:border-accent text-foreground transition-colors"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase tracking-widest text-accent mb-2 block font-medium">Fecha Hasta</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-background border border-border/30 p-3 text-xs focus:outline-none focus:border-accent text-foreground transition-colors"
                                    />
                                </div>
                            </div>
                            
                            {/* Orders List */}
                            {orders.filter((order) => {
                                if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
                                if (startDate && new Date(order.createdAt) < new Date(startDate)) return false;
                                if (endDate) {
                                    const end = new Date(endDate);
                                    end.setHours(23, 59, 59, 999);
                                    if (new Date(order.createdAt) > end) return false;
                                }
                                return true;
                            }).map((order) => (
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
                                                <span className="text-[10px] uppercase tracking-widest font-semibold text-foreground">
                                                    {statusTranslations[order.status] || order.status}
                                                </span>
                                            </div>

                                            <select
                                                defaultValue={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="w-full text-[10px] uppercase tracking-widest bg-background border border-border/30 px-3 py-2.5 text-foreground focus:outline-none focus:border-accent cursor-pointer transition-colors"
                                            >
                                                <option value="PENDING">Pendiente</option>
                                                <option value="SHIPPED">Despachado</option>
                                                <option value="DELIVERED">Entregado</option>
                                                <option value="RETURNED">Devuelto</option>
                                                <option value="CANCELLED">Cancelado</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-background/20 px-8 py-4 border-t border-border/10 flex flex-col gap-4">
                                        <div className="flex flex-wrap gap-4">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="text-[9px] uppercase tracking-widest text-muted border border-border/10 px-2 py-1 bg-background/30">
                                                    {item.variant.perfume.name} • {item.variant.size} × {item.quantity}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Bitácora de Estados */}
                                        {order.statusHistory && order.statusHistory.length > 0 && (
                                            <div className="mt-2 pt-4 border-t border-border/5">
                                                <span className="text-[9px] uppercase tracking-[0.2em] text-accent/60 mb-2 block font-medium">Historial de Estados (Bitácora)</span>
                                                <div className="flex flex-col gap-2">
                                                    {order.statusHistory.map((history: any) => (
                                                        <div key={history.id} className="flex items-center gap-3 text-[10px] text-muted font-sans">
                                                            <div className="w-1 h-1 rounded-full bg-accent/40" />
                                                            <span className="font-semibold text-foreground/80">
                                                                {statusTranslations[history.status] || history.status}:
                                                            </span>
                                                            <span>{new Date(history.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
                                            <label className="text-[10px] uppercase tracking-widest text-accent">Notas Olfativas</label>
                                            <textarea
                                                rows={3}
                                                placeholder="Salida: ...; Corazón: ...; Fondo: ..."
                                                value={editData.notes}
                                                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                                className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                            />
                                            <p className="text-[8px] text-muted italic">Usa punto y coma (;) para separar las fases y dos puntos (:) para el título.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-accent">Acordes Principales</label>
                                            <textarea
                                                rows={2}
                                                placeholder="cítrico, dulce:80, floral, amaderado"
                                                value={editData.accords}
                                                onChange={(e) => setEditData({ ...editData, accords: e.target.value })}
                                                className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                            />
                                            <p className="text-[8px] text-muted italic">Separa por comas. Opcional el peso (0-100) ej: cítrico:90.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end mb-1">
                                                <label className="text-[10px] uppercase tracking-widest text-accent">Imágenes del Perfume (Máx 5)</label>
                                                <button 
                                                    onClick={() => editFileInputRef.current?.click()}
                                                    disabled={JSON.parse(editData.images || '[]').length >= 5}
                                                    className="text-[10px] uppercase tracking-widest text-accent hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
                                                >
                                                    <Upload size={14} />
                                                    <span>Añadir Imagen</span>
                                                </button>
                                            </div>
                                            <input 
                                                type="file" 
                                                ref={editFileInputRef} 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, true)}
                                            />

                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                                {JSON.parse(editData.images || '[]').map((img: string, idx: number) => (
                                                    <div key={idx} className="relative aspect-square border border-border/30 overflow-hidden group">
                                                        <img 
                                                            src={img} 
                                                            alt={`Preview ${idx + 1}`} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button 
                                                                onClick={() => handleRemoveImage(idx, true)}
                                                                className="bg-rose-500 text-white p-1 rounded-full"
                                                            >
                                                                <Trash size={12} />
                                                            </button>
                                                        </div>
                                                        {idx === 0 && (
                                                            <div className="absolute top-0 left-0 bg-accent text-accent-foreground text-[8px] px-1.5 py-0.5 uppercase tracking-tighter font-bold">Principal</div>
                                                        )}
                                                    </div>
                                                ))}
                                                {JSON.parse(editData.images || '[]').length < 5 && (
                                                    <button 
                                                        onClick={() => editFileInputRef.current?.click()}
                                                        className="aspect-square border border-dashed border-border/30 flex flex-col items-center justify-center gap-2 text-muted hover:text-accent hover:border-accent transition-all bg-background/20"
                                                    >
                                                        <PlusCircle size={20} />
                                                        <span className="text-[8px] uppercase tracking-widest font-medium">Subir</span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="O pega una URL de imagen aquí para añadir..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const value = (e.target as HTMLInputElement).value;
                                                            if (value) {
                                                                const currentImages = JSON.parse(editData.images || '[]');
                                                                if (currentImages.length < 5) {
                                                                    currentImages.push(value);
                                                                    setEditData({ ...editData, images: JSON.stringify(currentImages), mainImage: currentImages[0] });
                                                                    (e.target as HTMLInputElement).value = '';
                                                                } else {
                                                                    alert('Máximo 5 imágenes permitidas.');
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    className="w-full bg-background border border-border/30 p-3 text-xs focus:outline-none focus:border-accent text-foreground"
                                                />
                                            </div>
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
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingProduct(product.id);
                                                            setEditData({
                                                                ...product,
                                                                images: product.images || JSON.stringify([product.mainImage])
                                                            });
                                                        }}
                                                        className="p-2 text-muted hover:text-accent transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="p-2 text-muted hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted font-sans line-clamp-2 italic mb-6">
                                                "{product.description}"
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-border/5 pt-6">
                                                {product.variants.map((variant: any) => (
                                                    <div key={variant.id} className="bg-background/40 p-3 border border-border/10">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    defaultValue={variant.size}
                                                                    onBlur={(e) => handleUpdateVariant(variant.id, 'size', e.target.value)}
                                                                    className="w-16 bg-transparent border-none p-0 text-[10px] uppercase tracking-widest focus:outline-none focus:ring-0 text-muted font-medium"
                                                                />
                                                                <button
                                                                    onClick={() => handleDeleteVariant(variant.id)}
                                                                    className="text-muted hover:text-rose-500 transition-colors"
                                                                >
                                                                    <Trash size={10} />
                                                                </button>
                                                            </div>
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
                                                <button 
                                                    onClick={() => handleAddVariant(product.id)}
                                                    className="border border-dashed border-border/30 p-3 flex flex-col items-center justify-center gap-1 text-muted hover:text-accent hover:border-accent transition-all group"
                                                >
                                                    <Plus size={14} />
                                                    <span className="text-[9px] uppercase tracking-widest font-medium">Añadir Medida</span>
                                                </button>
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
                                    <label className="text-[10px] uppercase tracking-widest text-accent">Notas Olfativas</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Salida: ...; Corazón: ...; Fondo: ..."
                                        value={newProductData.notes}
                                        onChange={(e) => setNewProductData({ ...newProductData, notes: e.target.value })}
                                        className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                    />
                                    <p className="text-[9px] text-muted italic">Ejemplo: Salida: Cítricos; Corazón: Jazmín; Fondo: Vainilla</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-accent">Acordes Principales</label>
                                    <textarea
                                        rows={2}
                                        placeholder="cítrico, dulce:80, floral, amaderado"
                                        value={newProductData.accords}
                                        onChange={(e) => setNewProductData({ ...newProductData, accords: e.target.value })}
                                        className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                    />
                                    <p className="text-[9px] text-muted italic">Separa los acordes por comas (ej: cítrico, dulce, floral).</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="text-[10px] uppercase tracking-widest text-accent">Imágenes del Perfume (Máx 5)</label>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={JSON.parse(newProductData.images || '[]').length >= 5}
                                                className="text-[10px] uppercase tracking-widest text-accent hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
                                            >
                                                <Upload size={14} />
                                                <span>Añadir Imagen</span>
                                            </button>
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, false)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                        {JSON.parse(newProductData.images || '[]').map((img: string, idx: number) => (
                                            <div key={idx} className="relative aspect-square border border-border/30 overflow-hidden group">
                                                <img 
                                                    src={img} 
                                                    alt={`Preview ${idx + 1}`} 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button 
                                                        onClick={() => handleRemoveImage(idx, false)}
                                                        className="bg-rose-500 text-white p-1 rounded-full"
                                                    >
                                                        <Trash size={12} />
                                                    </button>
                                                </div>
                                                {idx === 0 && (
                                                    <div className="absolute top-0 left-0 bg-accent text-accent-foreground text-[8px] px-1.5 py-0.5 uppercase tracking-tighter font-bold">Principal</div>
                                                )}
                                            </div>
                                        ))}
                                        {JSON.parse(newProductData.images || '[]').length < 5 && (
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square border border-dashed border-border/30 flex flex-col items-center justify-center gap-2 text-muted hover:text-accent hover:border-accent transition-all bg-background/20"
                                            >
                                                <PlusCircle size={20} />
                                                <span className="text-[8px] uppercase tracking-widest font-medium">Subir</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="O pega una URL de imagen aquí para añadir..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const value = (e.target as HTMLInputElement).value;
                                                    if (value) {
                                                        const currentImages = JSON.parse(newProductData.images || '[]');
                                                        if (currentImages.length < 5) {
                                                            currentImages.push(value);
                                                            const mainImg = currentImages[0];
                                                            setNewProductData({ ...newProductData, images: JSON.stringify(currentImages), mainImage: mainImg });
                                                            (e.target as HTMLInputElement).value = '';
                                                        } else {
                                                            alert('Máximo 5 imágenes permitidas.');
                                                        }
                                                    }
                                                }
                                            }}
                                            className="w-full bg-background border border-border/30 p-3 text-xs focus:outline-none focus:border-accent text-foreground"
                                        />
                                        <p className="text-[9px] text-muted italic">La primera imagen será la principal.</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-[10px] uppercase tracking-widest text-accent block">Configuración de Tamaños & Stock</label>
                                        <button 
                                            onClick={() => {
                                                const newVariants = [...newProductData.variants, { size: 'N/A', price: 0, stock: 0 }];
                                                setNewProductData({ ...newProductData, variants: newVariants });
                                            }}
                                            className="text-[10px] uppercase tracking-widest text-accent hover:text-white flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={14} />
                                            <span>Añadir Medida</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {newProductData.variants.map((variant: any, idx: number) => (
                                            <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-background/30 p-4 border border-border/5">
                                                <div className="col-span-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Tamaño (ej: 5ml)"
                                                        value={variant.size}
                                                        onChange={(e) => {
                                                            const newVariants = [...newProductData.variants];
                                                            newVariants[idx].size = e.target.value;
                                                            setNewProductData({ ...newProductData, variants: newVariants });
                                                        }}
                                                        className="w-full bg-transparent border-b border-border/50 p-1 text-xs uppercase tracking-widest focus:outline-none focus:border-accent text-foreground"
                                                    />
                                                </div>
                                                <div className="col-span-3 flex items-center gap-2 border-b border-border/50 pb-1">
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
                                                <div className="col-span-3 flex items-center gap-2 border-b border-border/50 pb-1">
                                                    <span className="text-[9px] text-muted font-sans italic">Stock:</span>
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
                                                <div className="col-span-2 flex justify-end">
                                                    <button 
                                                        onClick={() => {
                                                            const newVariants = newProductData.variants.filter((_: any, i: number) => i !== idx);
                                                            setNewProductData({ ...newProductData, variants: newVariants });
                                                        }}
                                                        className="text-muted hover:text-rose-500 transition-colors"
                                                    >
                                                        <MinusCircle size={18} />
                                                    </button>
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
