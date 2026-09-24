import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api.js";
import { products as fallbackProducts } from "../data/products.js";

const AuthContext = createContext(null);

// Only a non-sensitive profile is cached so the UI renders instantly; the session
// itself lives in an httpOnly cookie and is confirmed with /user/me on load.
function getCachedUser() {
    try {
        localStorage.removeItem("cc-token"); // tokens from before the cookie migration
        return JSON.parse(localStorage.getItem("cc-user") || "null");
    } catch {
        return null;
    }
}

function normalizeCart(items = []) {
    return items.flatMap((item) => {
        const product = item.productID;
        if (!product || typeof product !== "object") return [];
        return [{
            id: product._id,
            name: product.name,
            maker: product.shopName || "Independent maker",
            category: product.category,
            price: product.price ?? 0,
            image: product.imageUrl || fallbackProducts[0].image,
            description: product.description || "",
            quantity: item.qty,
            available: item.available !== false,
            unavailableReason: item.unavailableReason || "",
        }];
    });
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getCachedUser);
    const [authChecked, setAuthChecked] = useState(false);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    // Bumped on login so a slower, older /user/me response can't overwrite a fresh session.
    const sessionVersion = useRef(0);

    const login = useCallback((session) => {
        sessionVersion.current += 1;
        const account = session.user;
        localStorage.setItem("cc-user", JSON.stringify(account));
        setUser(account);
        setAuthChecked(true);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem("cc-user");
        setUser(null);
        setCart([]);
        setOrders([]);
    }, []);

    const logout = useCallback(() => {
        clearSession();
        api.post("/user/Signout").catch(() => {});
    }, [clearSession]);

    useEffect(() => {
        window.addEventListener("cc:auth-expired", clearSession);
        return () => window.removeEventListener("cc:auth-expired", clearSession);
    }, [clearSession]);

    useEffect(() => {
        let cancelled = false;
        const startedAt = sessionVersion.current;
        const isStale = () => cancelled || sessionVersion.current !== startedAt;
        api.get("/user/me")
            .then(({ data }) => {
                if (isStale()) return;
                localStorage.setItem("cc-user", JSON.stringify(data.user));
                setUser(data.user);
            })
            .catch(() => {
                if (!isStale()) clearSession();
            })
            .finally(() => {
                if (!cancelled) setAuthChecked(true);
            });
        return () => {
            cancelled = true;
        };
    }, [clearSession]);

    const refreshCart = useCallback(async () => {
        const { data } = await api.get("/cart");
        const nextCart = normalizeCart(data.items);
        setCart(nextCart);
        return nextCart;
    }, []);

    const refreshOrders = useCallback(async () => {
        const role = user?.role;
        if (role !== "buyer" && role !== "seller") return [];
        const endpoint = role === "buyer" ? "/order/view/buyer" : "/order/view/seller";
        const { data } = await api.get(endpoint);
        const nextOrders = role === "buyer" ? data.orders || [] : data.list_of_orders || [];
        setOrders(nextOrders);
        return nextOrders;
    }, [user?.role]);

    useEffect(() => {
        if (user?.role === "buyer") {
            void Promise.resolve().then(refreshCart).catch(() => setCart([]));
            void Promise.resolve().then(refreshOrders).catch(() => setOrders([]));
        } else if (user?.role === "seller") {
            void Promise.resolve().then(refreshOrders).catch(() => setOrders([]));
        }
    }, [user?.id, user?.role, refreshCart, refreshOrders]);

    const addToCart = useCallback(async (product) => {
        await api.post("/cart", { productID: product._id || product.id });
        return refreshCart();
    }, [refreshCart]);

    const updateQuantity = useCallback(async (productId, quantity) => {
        if (quantity < 1) return api.delete(`/cart/item/${productId}`).then(refreshCart);
        await api.put(`/cart/${productId}`, { qty: quantity });
        return refreshCart();
    }, [refreshCart]);

    const removeFromCart = useCallback(async (productId) => {
        await api.delete(`/cart/item/${productId}`);
        return refreshCart();
    }, [refreshCart]);

    const placeOrder = useCallback(async (details) => {
        try {
            const { data } = await api.post("/order/checkout", details);
            setCart([]);
            setOrders((current) => [data.order, ...current]);
            return data.order;
        } catch (error) {
            // Show which items became unavailable.
            if (error.response?.data?.code === "ITEMS_UNAVAILABLE") refreshCart().catch(() => {});
            throw error;
        }
    }, [refreshCart]);

    const value = useMemo(() => ({
        user,
        authChecked,
        cart,
        orders,
        login,
        logout,
        refreshCart,
        refreshOrders,
        addToCart,
        updateQuantity,
        removeFromCart,
        placeOrder,
    }), [user, authChecked, cart, orders, login, logout, refreshCart, refreshOrders, addToCart, updateQuantity, removeFromCart, placeOrder]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
