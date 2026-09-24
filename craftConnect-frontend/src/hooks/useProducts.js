import { useCallback, useEffect, useState } from "react";
import api, { getApiError } from "../services/api.js";

export default function useProducts({ seller = false } = {}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(seller ? "/product/my" : "/product", {
                params: { page: 1, limit: 100 },
            });
            setProducts(data.products || []);
        } catch (requestError) {
            setError(getApiError(requestError));
        } finally {
            setLoading(false);
        }
    }, [seller]);

    useEffect(() => {
        void Promise.resolve().then(refresh);
    }, [refresh]);
    return { products, loading, error, refresh, setProducts };
}
