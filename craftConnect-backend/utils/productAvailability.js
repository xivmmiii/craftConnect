// Products buyers may see and purchase: listed by the seller and seller not suspended.
export const PUBLIC_PRODUCT_FILTER = { isActive: true, sellerSuspended: { $ne: true } };

export const getUnavailableReason = (product, qty) => {
    if (!product || !product.isActive || product.sellerSuspended) return "no longer available";
    if (product.stock < 1) return "out of stock";
    if (product.stock < qty) return `only ${product.stock} left`;
    return null;
};
