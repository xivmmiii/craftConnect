const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Rounds to cents so float sums like 0.1 + 0.2 never show as $0.30000000000000004.
export const formatPrice = (amount) => currency.format(Number(amount) || 0);
