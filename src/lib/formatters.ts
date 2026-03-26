export const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace(/,/g, '.');
};

export const formatPrice = (price: number) => {
    return `$ ${formatCOP(price)}`;
};
