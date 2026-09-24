import { useCallback, useEffect, useState } from "react";
import api, { getApiError } from "../services/api.js";
import { formatPrice } from "../utils/formatPrice.js";
import { OrdersManager, ProductsManager, UsersManager } from "./AdminManage.jsx";

export default function AdminDashboard() {
    const [summary, setSummary] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // Bumped after any change so every panel reloads its list.
    const [version, setVersion] = useState(0);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [summaryResponse, usersResponse, productsResponse, ordersResponse] = await Promise.all([
                api.get("/admin/summary"),
                api.get("/admin/user", { params: { page: 1, limit: 5 } }),
                api.get("/admin/product", { params: { page: 1, limit: 5, isActive: "true" } }),
                api.get("/admin/order", { params: { page: 1, limit: 5 } }),
            ]);
            setSummary(summaryResponse.data);
            setUsers(usersResponse.data.users || []);
            setProducts(productsResponse.data.products || []);
            setOrders(ordersResponse.data.orders || []);
        } catch (requestError) {
            setError(getApiError(requestError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void Promise.resolve().then(refresh);
    }, [refresh]);

    const changed = useCallback(() => {
        setVersion((current) => current + 1);
        void refresh();
    }, [refresh]);

    const setMemberActive = async (id, isActive) => {
        try {
            await api.put(`/admin/user/${id}/${isActive ? "activate" : "deactivate"}`);
            changed();
        } catch (requestError) {
            setError(getApiError(requestError));
        }
    };

    const deactivateProduct = async (id) => {
        try {
            await api.put(`/admin/product/${id}`, { isActive: false });
            changed();
        } catch (requestError) {
            setError(getApiError(requestError));
        }
    };

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
                    <div><span>Orders placed today</span><strong>{summary?.ordersToday ?? "—"}</strong></div>
                    <div><span>Recent orders loaded</span><strong>{orders.length}</strong></div>
                </div>
            </section>
            <section className="dashboard-panel" id="orders">
                <div className="panel-heading"><div><p className="dashboard-kicker">A little activity</p><h2>Fresh from the community.</h2></div></div>
                {loading ? <p className="dashboard-message">Loading marketplace activity…</p> : <div className="seller-listings">
                    {users.slice(0, 3).map((member) => <div className="seller-listing" key={member._id}><span>✳</span><div><strong>{member.name} joined</strong><p>{member.role} · {member.emailID}{member.isActive ? "" : " · Deactivated"}</p></div>{member.role !== "admin" && <button onClick={() => setMemberActive(member._id, !member.isActive)}>{member.isActive ? "Deactivate" : "Reactivate"}</button>}</div>)}
                    {products.slice(0, 3).map((product) => <div className="seller-listing" key={product._id}><span>↗</span><div><strong>{product.name}</strong><p>{product.category} · {formatPrice(product.price)} · {product.stock} in stock</p></div><button onClick={() => deactivateProduct(product._id)}>Remove</button></div>)}
                    {orders.slice(0, 3).map((order) => <div className="seller-listing" key={order._id}><span>01</span><div><strong>Order {String(order._id).slice(-8)}</strong><p>{new Date(order.orderDate).toLocaleDateString()} · {order.status || "placed"}</p></div><span className="listing-status">{order.items?.length || 0} items</span></div>)}
                    {!users.length && !products.length && !orders.length && <p className="dashboard-message">No marketplace activity yet.</p>}
                </div>}
            </section>
            <UsersManager version={version} onChange={changed} />
            <ProductsManager version={version} onChange={changed} />
            <OrdersManager version={version} onChange={changed} />
        </div>
    );
}
