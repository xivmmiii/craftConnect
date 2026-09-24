const amountFormat = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Rounds to paise so float sums like 0.1 + 0.2 never show as Rs. 0.30000000000000004.
export const formatPrice = (amount) => `Rs. ${amountFormat.format(Number(amount) || 0)}`;
