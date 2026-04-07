"use client";

import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Clock, CheckCircle2, Truck, XCircle, ChevronLeft, ChevronRight, Package, ShoppingCart, Edit2, Save, Trash2, Camera, Upload, Image as ImageIcon, Plus, Trash, PlusCircle, MinusCircle, LogIn, Eye, EyeOff, BarChart2 } from 'lucide-react';
import { getOrders, updateOrderStatus, getAdminProducts, updateProduct, updateVariant, createProduct, deleteProduct, createVariant, deleteVariant, adminLogin, getCarouselImages, addVariant, updateCarouselImage, deleteCarouselImage } from '@/lib/actions';
import { formatPrice } from '@/lib/formatters';
import AdminCharts from '@/components/AdminCharts';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'create' | 'carousel' | 'stats'>('orders');
    
    // Auth
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginEmail, setLoginEmail] = useState('admin@perfumeria.com');
    const [loginPassword, setLoginPassword] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [carouselImages, setCarouselImages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [isAddingVariant, setIsAddingVariant] = useState<string | null>(null);
    const [newVariantData, setNewVariantData] = useState({ size: '', price: 0, stock: 0 });
    const [editData, setEditData] = useState<any>({});
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const editFileInputRef = React.useRef<HTMLInputElement>(null);

    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Optimización de Imágenes
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationProgress, setOptimizationProgress] = useState(0);

    // Filtros de Inventario
    const [searchName, setSearchName] = useState('');
    const [searchBrand, setSearchBrand] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchGender, setSearchGender] = useState('');
    
    // Filtros de Pedidos
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Paginación
    const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredProducts = products.filter((p: any) => {
        const matchName = searchName === '' || p.name.toLowerCase().includes(searchName.toLowerCase());
        const matchBrand = searchBrand === '' || p.brand.toLowerCase().includes(searchBrand.toLowerCase());
        const matchCategory = searchCategory === '' || p.category === searchCategory;
        const matchGender = searchGender === '' || p.gender === searchGender;
        return matchName && matchBrand && matchCategory && matchGender;
    });

    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = itemsPerPage === 'all' 
        ? filteredProducts 
        : filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchName, searchBrand, searchCategory, searchGender, itemsPerPage]);
    
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
        notes: '',
        mainImage: '',
        images: '[]',
        accords: '',
        gender: 'Unisex',
        variants: [
            { size: '5ml', price: 0, stock: 10 }
        ]
    });

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');
        const result = await adminLogin(loginEmail, loginPassword);
        if (result.success) {
            setIsAuthenticated(true);
            fetchOrders();
        } else {
            setLoginError(result.error || 'Error al iniciar sesión.');
        }
        setLoginLoading(false);
    }

    useEffect(() => {

        if (activeTab === 'orders' || activeTab === 'stats') {
            fetchOrders();
            if (activeTab === 'stats') fetchProducts(); // We need products for the inventory pie chart
        } else if (activeTab === 'inventory') {
            fetchProducts();
        } else if (activeTab === 'carousel') {
            fetchCarousel();
        }
    }, [activeTab, isAuthenticated]);

    async function fetchCarousel() {
        try {
            setIsLoading(true);
            const data = await getCarouselImages();
            setCarouselImages(data);
        } catch (error) {
            console.error('Error fetching carousel:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchOrders() {
        try {
            setIsLoading(true);
            const data = await getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoginError('Error al cargar pedidos. Verifica la base de datos.');
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchProducts() {
        try {
            setIsLoading(true);
            const data = await getAdminProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
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
            category: editData.category,
            gender: editData.gender,
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

    async function handleAddVariant(perfumeId: string) {
        const result = await addVariant(perfumeId, newVariantData);
        if (result.success) {
            setIsAddingVariant(null);
            setNewVariantData({ size: '', price: 0, stock: 0 });
            fetchProducts();
        }
    }

    async function handleUpdateVariant(variantId: string, field: 'price' | 'stock' | 'size', value: any) {
        const result = await updateVariant(variantId, { [field]: (field === 'price' || field === 'stock') ? Number(value) : value });
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
                brand: '', name: '', category: 'Nicho', description: '', notes: '', mainImage: '', gender: 'Unisex',
                images: '[]', accords: '',
                variants: [
                    { size: '5ml', price: 0, stock: 10 }
                ]
            });
        }
        setIsLoading(false);
    }

    const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000, quality = 0.7): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        });
    };

    const handleCarouselUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number, id: string | null) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // Relajamos el límite ya que comprimiremos
            alert('La imagen es demasiado grande. Máximo 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Original = reader.result as string;
            const base64Compressed = await compressImage(base64Original);
            await updateCarouselImage(id, { imageUrl: base64Compressed, order: index });
            fetchCarousel();
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('La imagen es demasiado grande. Por favor usa una imagen de menos de 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Original = reader.result as string;
            const base64Compressed = await compressImage(base64Original);
            
            if (isEdit) {
                const currentImages = JSON.parse(editData.images || '[]');
                if (index !== undefined) {
                    currentImages[index] = base64Compressed;
                } else if (currentImages.length < 5) {
                    currentImages.push(base64Compressed);
                }
                const mainImg = currentImages[0] || '';
                setEditData({ ...editData, images: JSON.stringify(currentImages), mainImage: mainImg });
            } else {
                const currentImages = JSON.parse(newProductData.images || '[]');
                if (index !== undefined) {
                    currentImages[index] = base64Compressed;
                } else if (currentImages.length < 5) {
                    currentImages.push(base64Compressed);
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

    const handleOptimizeAllImages = async () => {
        if (!confirm('Esto optimizará todas las imágenes de tu inventario para reducir su peso considerablemente. El proceso puede tardar unos minutos. ¿Deseas continuar?')) return;
        
        setIsOptimizing(true);
        setOptimizationProgress(0);
        
        try {
            const allProducts = await getAdminProducts();
            const total = allProducts.length;
            
            for (let i = 0; i < total; i++) {
                const product = allProducts[i];
                let needsUpdate = false;
                
                // Procesar imágenes secundarias
                let currentImages = [];
                try {
                    currentImages = JSON.parse(product.images || '[]');
                } catch (e) {
                    currentImages = product.mainImage ? [product.mainImage] : [];
                }
                
                const newImages = [];
                for (const img of currentImages) {
                    if (img.startsWith('data:image') && img.length > 200000) { // Solo si son Base64 y pesan > 200KB aprox
                        const compressed = await compressImage(img);
                        newImages.push(compressed);
                        needsUpdate = true;
                    } else {
                        newImages.push(img);
                    }
                }
                
                // Procesar imagen principal si no está en las secundarias o es distinta
                let newMainImage = product.mainImage;
                if (product.mainImage?.startsWith('data:image') && product.mainImage.length > 200000) {
                    newMainImage = await compressImage(product.mainImage);
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await updateProduct(product.id, {
                        brand: product.brand,
                        name: product.name,
                        category: product.category,
                        description: product.description,
                        notes: product.notes,
                        accords: product.accords ?? undefined,
                        gender: product.gender,
                        mainImage: newMainImage,
                        images: JSON.stringify(newImages)
                    });
                }
                
                setOptimizationProgress(Math.round(((i + 1) / total) * 100));
            }

            // También optimizar carrusel
            const carousel = await getCarouselImages();
            for (const item of carousel) {
                if (item.imageUrl.startsWith('data:image') && item.imageUrl.length > 200000) {
                    const compressed = await compressImage(item.imageUrl);
                    await updateCarouselImage(item.id, { imageUrl: compressed, order: item.order });
                }
            }

            alert('¡Optimización completada con éxito! Tus imágenes ahora ocupan mucho menos espacio.');
            fetchProducts();
            fetchCarousel();
        } catch (error) {
            console.error('Error durante la optimización:', error);
            alert('Hubo un error durante la optimización. Por favor reintenta luego.');
        } finally {
            setIsOptimizing(false);
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

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-accent mb-4 block">Panel de Control</span>
                        <h1 className="text-3xl font-serif text-foreground">Acceso Admin</h1>
                    </div>

                    <form onSubmit={handleLogin} className="bg-card border border-border/20 p-10 glass space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-accent block">Email</label>
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                                className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-accent block">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <p className="text-xs text-rose-400 text-center">{loginError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="w-full bg-accent text-accent-foreground py-4 text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loginLoading ? (
                                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                                <LogIn size={14} />
                            )}
                            <span>{loginLoading ? 'Verificando...' : 'Ingresar'}</span>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-accent mb-4 block">Panel de Control</span>
                        <h1 className="text-4xl md:text-5xl font-serif text-foreground">Administración</h1>
                    </div>

                    <div className="flex flex-wrap overflow-x-auto bg-card/50 p-1 border border-border/20 glass backdrop-blur-md">
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
                            onClick={() => setActiveTab('carousel')}
                            className={`px-6 py-2.5 text-[10px] uppercase tracking-widest transition-all ${activeTab === 'carousel' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Camera size={14} />
                                <span>Carrusel</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`px-6 py-2.5 text-[10px] uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'}`}
                        >
                            <div className="flex items-center gap-2">
                                <BarChart2 size={14} />
                                <span>Estadísticas</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-6 py-2.5 text-[10px] uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'}`}
                        >
                            <div className="flex items-center gap-2">
                                <PlusCircle size={14} />
                                <span>Crear</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="px-6 py-2.5 text-[10px] uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all border-l border-border/20"
                        >
                            <span>Salir</span>
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
                ) : activeTab === 'stats' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <AdminCharts orders={orders} products={products} />
                        
                        {/* Image Optimization Section */}
                        <div className="bg-card border border-accent/20 p-10 glass relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <ImageIcon size={120} />
                            </div>
                            <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-sans mb-4 block">Mantenimiento de Sistema</span>
                                <h3 className="text-2xl font-serif mb-6 italic">Optimizador de Imágenes</h3>
                                <p className="text-sm font-sans opacity-70 mb-8 leading-relaxed">
                                    Esta herramienta reducirá el peso de todas las fotos de tu inventario sin perder calidad visual. 
                                    Esto ayuda a que la página cargue más rápido y a no superar los límites de almacenamiento.
                                </p>
                                
                                {isOptimizing ? (
                                    <div className="space-y-6">
                                        <div className="w-full bg-background/50 h-2 border border-border/10 overflow-hidden">
                                            <div 
                                                className="bg-accent h-full transition-all duration-500" 
                                                style={{ width: `${optimizationProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest text-accent animate-pulse">
                                            Optimizando: {optimizationProgress}% completo...
                                        </p>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleOptimizeAllImages}
                                        className="inline-flex items-center gap-3 px-10 py-4 bg-accent text-accent-foreground text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                                    >
                                        <Camera size={14} />
                                        <span>Comenzar Optimización Total</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'inventory' ? (
                    /* INVENTORY TAB */
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* Search / Filter Bar */}
                        <div className="bg-card border border-border/20 p-5 glass">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] uppercase tracking-[0.3em] text-accent font-medium">Filtrar Inventario</span>
                                <button
                                    onClick={() => setActiveTab('create')}
                                    className="px-4 py-1.5 bg-accent/10 border border-accent/20 text-accent text-[9px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center gap-2"
                                >
                                    <Plus size={12} />
                                    <span>Nuevo Producto</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest text-muted">Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre..."
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        className="w-full bg-background border border-border/30 px-3 py-2 text-xs focus:outline-none focus:border-accent text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest text-muted">Marca</label>
                                    <input
                                        type="text"
                                        placeholder="Buscar por marca..."
                                        value={searchBrand}
                                        onChange={(e) => setSearchBrand(e.target.value)}
                                        className="w-full bg-background border border-border/30 px-3 py-2 text-xs focus:outline-none focus:border-accent text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest text-muted">Categoría</label>
                                    <select
                                        value={searchCategory}
                                        onChange={(e) => setSearchCategory(e.target.value)}
                                        className="w-full bg-background border border-border/30 px-3 py-2 text-xs focus:outline-none focus:border-accent text-foreground"
                                    >
                                        <option value="">Todas</option>
                                        <option value="Nicho">Nicho</option>
                                        <option value="Árabe">Árabe</option>
                                        <option value="Diseñador">Diseñador</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest text-muted">Género</label>
                                    <select
                                        value={searchGender}
                                        onChange={(e) => setSearchGender(e.target.value)}
                                        className="w-full bg-background border border-border/30 px-3 py-2 text-xs focus:outline-none focus:border-accent text-foreground"
                                    >
                                        <option value="">Todos</option>
                                        <option value="Male">Hombre</option>
                                        <option value="Female">Mujer</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest text-muted">Mostrar</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        className="w-full bg-background border border-border/30 px-3 py-2 text-xs focus:outline-none focus:border-accent text-foreground"
                                    >
                                        <option value={5}>5 por página</option>
                                        <option value={10}>10 por página</option>
                                        <option value={20}>20 por página</option>
                                        <option value="all">Ver Todos</option>
                                    </select>
                                </div>
                            </div>
                            {(searchName || searchBrand || searchCategory || searchGender) && (
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/10">
                                    <span className="text-[9px] text-muted">{filteredProducts.length} resultado(s) encontrado(s)</span>
                                    <button
                                        onClick={() => { setSearchName(''); setSearchBrand(''); setSearchCategory(''); setSearchGender(''); }}
                                        className="text-[9px] uppercase tracking-widest text-accent hover:opacity-70 transition-opacity"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                        {paginatedProducts.map((product: any) => (
                            <div key={product.id} className="bg-card border border-border/20 p-8 hover:border-accent/40 transition-all duration-500">
                                {editingProduct === product.id ? (
                                    /* Edit Mode */
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-accent">Marca</label>
                                                <input
                                                    type="text"
                                                    value={editData.brand || ''}
                                                    onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                                                    className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-accent">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={editData.name || ''}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-accent">Categoría</label>
                                                <select
                                                    value={editData.category || ''}
                                                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                                    className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                                                >
                                                    <option value="Nicho">Nicho</option>
                                                    <option value="Árabe">Árabe</option>
                                                    <option value="Diseñador">Diseñador</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-accent">Género</label>
                                                <select
                                                    value={editData.gender || ''}
                                                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                                    className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground"
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
                                                rows={3}
                                                value={editData.description || ''}
                                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-accent">Notas Olfativas</label>
                                            <textarea
                                                rows={2}
                                                value={editData.notes || ''}
                                                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                                className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                                placeholder="Ej: Salida: Cítricos, Corazón: Rosa, Fondo: Ámbar"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-accent">Acordes Principales</label>
                                            <textarea
                                                rows={2}
                                                placeholder="cítrico, dulce, floral, amaderado"
                                                value={editData.accords || ''}
                                                onChange={(e) => setEditData({ ...editData, accords: e.target.value })}
                                                className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end mb-1">
                                                <label className="text-[10px] uppercase tracking-widest text-accent">Imagen Principal</label>
                                                <label className="text-[9px] text-accent uppercase tracking-widest cursor-pointer hover:underline flex items-center gap-1">
                                                    <Upload size={10} /> Adjuntar
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                value={editData.mainImage || ''}
                                                onChange={(e) => setEditData({ ...editData, mainImage: e.target.value })}
                                                className="w-full bg-background border border-border/30 p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                                                placeholder="URL de la imagen"
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
                                        <div className="w-32 h-44 bg-background border border-border/10 flex-shrink-0 group overflow-hidden relative p-2">
                                            <img
                                                src={product.mainImage}
                                                alt={product.name}
                                                className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-700"
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
                                                                images: product.images || '[]'
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
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/5 pt-6">
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
                                                            <span className="text-xs font-sans text-accent font-medium">
                                                                {formatPrice(variant.price)}
                                                            </span>
                                                            <input
                                                                type="number"
                                                                placeholder="Editar"
                                                                defaultValue={variant.price}
                                                                onBlur={(e) => handleUpdateVariant(variant.id, 'price', parseFloat(e.target.value))}
                                                                className="w-16 bg-transparent border-none p-0 text-[10px] focus:outline-none focus:ring-0 text-muted/40 hover:text-foreground transition-colors ml-auto text-right"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add Variant Toggle */}
                                                {isAddingVariant === product.id ? (
                                                    <div className="bg-accent/5 p-3 border border-accent/20 space-y-3">
                                                        <input 
                                                            placeholder="Medida (ej: 50ml)"
                                                            className="w-full bg-background border border-border/20 text-[10px] p-2 focus:outline-none"
                                                            onChange={(e) => setNewVariantData({...newVariantData, size: e.target.value})}
                                                        />
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="number" 
                                                                placeholder="Precio"
                                                                className="w-1/2 bg-background border border-border/20 text-[10px] p-2 focus:outline-none"
                                                                onChange={(e) => setNewVariantData({...newVariantData, price: Number(e.target.value)})}
                                                            />
                                                            <input 
                                                                type="number" 
                                                                placeholder="Stock"
                                                                className="w-1/2 bg-background border border-border/20 text-[10px] p-2 focus:outline-none"
                                                                onChange={(e) => setNewVariantData({...newVariantData, stock: Number(e.target.value)})}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleAddVariant(product.id)}
                                                                className="w-full bg-accent text-[9px] text-white py-1 uppercase tracking-widest"
                                                            >
                                                                Añadir
                                                            </button>
                                                            <button 
                                                                onClick={() => setIsAddingVariant(null)}
                                                                className="w-full bg-card border border-border/20 text-[9px] py-1 uppercase tracking-widest"
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setIsAddingVariant(product.id)}
                                                        className="flex flex-col items-center justify-center p-3 border border-dashed border-border/30 hover:border-accent/40 hover:bg-accent/5 transition-all text-muted hover:text-accent group"
                                                    >
                                                        <span className="text-[10px] uppercase tracking-widest">+ Añadir Medida</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        </div>

                        {/* Pagination Controls */}
                        {itemsPerPage !== 'all' && totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 pt-8">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-2 text-muted hover:text-accent disabled:opacity-20 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-[10px] uppercase tracking-widest font-medium">
                                    Página <span className="text-accent">{currentPage}</span> de {totalPages}
                                </span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-2 text-muted hover:text-accent disabled:opacity-20 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'carousel' ? (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
                        <div className="bg-card border border-border/20 p-8 glass">
                            <h2 className="text-xl font-serif mb-6 text-foreground">Gestión de Carrusel (Máx 3 imágenes)</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[0, 1, 2].map((index) => {
                                    const img = carouselImages.find(c => c.order === index);
                                    return (
                                        <div key={index} className="space-y-4 p-4 border border-border/10 bg-background/20 relative">
                                            <div className="aspect-video bg-black/10 overflow-hidden relative group">
                                                {img ? (
                                                    <img src={img.imageUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted uppercase tracking-widest">Vacío</div>
                                                )}
                                                {img && (
                                                    <button 
                                                        onClick={() => deleteCarouselImage(img.id).then(fetchCarousel)}
                                                        className="absolute top-2 right-2 p-1 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center px-1">
                                                <input 
                                                    type="text" 
                                                    placeholder="URL Imagen"
                                                    defaultValue={img?.imageUrl || ''}
                                                    className="flex-grow bg-background border border-border/20 p-2 text-[10px] focus:outline-none focus:border-accent"
                                                    onBlur={(e) => {
                                                        if (e.target.value) {
                                                            updateCarouselImage(img?.id || null, { 
                                                                imageUrl: e.target.value, 
                                                                order: index 
                                                            }).then(fetchCarousel);
                                                        }
                                                    }}
                                                />
                                                <label className="ml-2 p-2 bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all cursor-pointer">
                                                    <Upload size={12} />
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*" 
                                                        onChange={(e) => handleCarouselUpload(e, index, img?.id || null)} 
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-6 text-[9px] text-muted uppercase tracking-widest italic text-center">
                                * Los cambios se aplican automáticamente al salir del campo de texto (Blur).
                            </p>
                        </div>
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
                                        rows={3}
                                        placeholder="Describe la fragancia..."
                                        value={newProductData.description}
                                        onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                                        className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-accent">Notas Olfativas</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Salida: ..., Corazón: ..., Fondo: ..."
                                        value={newProductData.notes}
                                        onChange={(e) => setNewProductData({ ...newProductData, notes: e.target.value })}
                                        className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-accent">Acordes Principales</label>
                                    <textarea
                                        rows={2}
                                        placeholder="cítrico, dulce, floral, amaderado"
                                        value={newProductData.accords}
                                        onChange={(e) => setNewProductData({ ...newProductData, accords: e.target.value })}
                                        className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="text-[10px] uppercase tracking-widest text-accent">Imagen Principal</label>
                                        <label className="text-[9px] text-accent uppercase tracking-widest cursor-pointer hover:underline flex items-center gap-1">
                                            <Upload size={10} /> Adjuntar
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="URL de la imagen o adjunta un archivo"
                                        value={newProductData.mainImage}
                                        onChange={(e) => setNewProductData({ ...newProductData, mainImage: e.target.value })}
                                        className="w-full bg-background border border-border/30 p-4 text-sm focus:outline-none focus:border-accent text-foreground"
                                    />
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
