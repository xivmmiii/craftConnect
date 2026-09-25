import { useCallback, useEffect, useRef, useState } from "react";
import api, { getApiError } from "../services/api.js";
import { OrdersManager, ProductsManager, UsersManager } from "./AdminManage.jsx";

export default function AdminDashboard() {
    const [summary, setSummary] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const refreshVersion = useRef(0);
    // Bumped after any change so every panel reloads its list.
    const [version, setVersion] = useState(0);

    const refresh = useCallback(async () => {
        const currentRefresh = ++refreshVersion.current;
        setLoading(true);
        setError("");
        try {
            const [summaryResponse, ordersResponse] = await Promise.all([
                api.get("/admin/summary"),
                api.get("/admin/order", { params: { page: 1, limit: 5 } }),
            ]);
            if (currentRefresh !== refreshVersion.current) return;
            setSummary(summaryResponse.data);
            setOrders(ordersResponse.data.orders || []);
        } catch (requestError) {
            if (currentRefresh !== refreshVersion.current) return;
            setError(getApiError(requestError));
        } finally {
            if (currentRefresh === refreshVersion.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        void Promise.resolve().then(refresh);
    }, [refresh]);

    const changed = useCallback(() => {
        setVersion((current) => current + 1);
        void refresh();
    }, [refresh]);

    return (
        <div className="dashboard-content">
            <p className="dashboard-kicker">Control room</p>
            <h1>Keep the good<br /><em>things moving.</em></h1>
            <p className="dashboard-intro">A clear view of the community, marketplace, and orders.</p>
            {error && <p className="dashboard-message dashboard-message-error" role="alert">{error}</p>}
            <div className="dashboard-stats">
                <div><span>Community members</span><strong>{summary?.totalUsers ?? (loading ? "—" : "0")}</strong></div>
                <div><span>Active listings</span><strong>{summary?.activeProducts ?? (loading ? "—" : "0")}</strong></div>
                <div><span>Open orders</span><strong>{summary?.openOrders ?? (loading ? "—" : "0")}</strong></div>
            </div>
            <section className="dashboard-panel" id="products">
                <div className="panel-heading"><div><p className="dashboard-kicker">Platform pulse</p><h2>Everything in one view.</h2></div><button className="seller-add-link" onClick={changed} disabled={loading}>Refresh ↻</button></div>
                <div className="admin-grid">
                    <div><span>Active community members</span><strong>{summary?.activeUsers ?? "—"}</strong></div>
                    <div><span>Recent orders loaded</span><strong>{orders.length}</strong></div>
                </div>
            </section>
            <UsersManager version={version} onChange={changed} />
            <ProductsManager version={version} onChange={changed} />
            <OrdersManager version={version} onChange={changed} />
        </div>
    );
}
