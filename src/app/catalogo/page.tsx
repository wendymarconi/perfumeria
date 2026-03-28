import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; gender?: string; q?: string }>;
}) {
    const { category, gender, q } = await searchParams;

    const perfumes = await prisma.perfume.findMany({
        where: {
            AND: [
                category ? { category } : {},
                gender ? { gender } : {},
                q ? {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { brand: { contains: q, mode: "insensitive" } },
                        { description: { contains: q, mode: "insensitive" } },
                        { notes: { contains: q, mode: "insensitive" } }
                    ]
                } : {}
            ],
        },
        include: {
            variants: {
                orderBy: {
                    price: "asc",
                },
            },
        },
    });

    const categories = ["Arabe", "Nicho", "Diseñador"];
    const genders = ["Male", "Female", "Unisex"];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <header className="mb-16">
                    <span className="text-xs uppercase tracking-[0.3em] text-accent font-sans mb-4 block">
                        Explora
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif">
                        {q ? `Resultados para "${q}"` : "Nuestro Catálogo"}
                    </h1>
                </header>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-32 space-y-10">
                            {/* Category Filter */}
                            <div>
                                <h3 className="text-xs uppercase tracking-widest font-sans mb-6 opacity-50">
                                    Categoría
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a
                                            href="/catalogo"
                                            className={`text-sm uppercase tracking-widest hover:text-accent transition-colors ${!category ? "text-accent font-medium" : "text-muted"
                                                }`}
                                        >
                                            Todos
                                        </a>
                                    </li>
                                    {categories.map((cat) => (
                                        <li key={cat}>
                                            <a
                                                href={`/catalogo?category=${cat}${gender ? `&gender=${gender}` : ""}`}
                                                className={`text-sm uppercase tracking-widest hover:text-accent transition-colors ${category === cat ? "text-accent font-medium" : "text-muted"
                                                    }`}
                                            >
                                                {cat}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Gender Filter */}
                            <div>
                                <h3 className="text-xs uppercase tracking-widest font-sans mb-6 opacity-50">
                                    Género
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a
                                            href="/catalogo"
                                            className={`text-sm uppercase tracking-widest hover:text-accent transition-colors ${!gender ? "text-accent font-medium" : "text-muted"
                                                }`}
                                        >
                                            Todos
                                        </a>
                                    </li>
                                    {genders.map((g) => (
                                        <li key={g}>
                                            <a
                                                href={`/catalogo?gender=${g}${category ? `&category=${category}` : ""}`}
                                                className={`text-sm uppercase tracking-widest hover:text-accent transition-colors ${gender === g ? "text-accent font-medium" : "text-muted"
                                                    }`}
                                            >
                                                {g === "Male" ? "Hombre" : g === "Female" ? "Mujer" : "Unisex"}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-grow">
                        {perfumes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                                {perfumes.map((perfume) => (
                                    <ProductCard
                                        key={perfume.id}
                                        perfume={perfume}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 border border-dashed border-border">
                                <p className="text-muted font-serif italic text-lg">
                                    No se encontraron perfumes con estos filtros.
                                </p>
                                <a
                                    href="/catalogo"
                                    className="mt-6 inline-block text-xs uppercase tracking-widest border-b border-black pb-1 hover:text-accent hover:border-accent transition-all"
                                >
                                    Limpiar Filtros
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
