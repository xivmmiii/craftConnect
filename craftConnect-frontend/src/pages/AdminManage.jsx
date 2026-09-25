import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api, { getApiError } from "../services/api.js";
import { formatPrice } from "../utils/formatPrice.js";

const PAGE_SIZE = 8;
const ORDER_STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const PAYMENT_MODES = ["COD", "UPI", "netbanking", "card"];

// Loads one page of an admin list; reloads when the page, filter, or version changes.
function usePagedList(endpoint, key, params, version) {
    const [page, setPage] = useState(1);
    const [state, setState] = useState({ items: [], total: 0, totalPages: 1, loading: true, error: "" });
    const requestVersion = useRef(0);
    const query = JSON.stringify(params);

    const load = useCallback(async () => {
        const currentRequest = ++requestVersion.current;
        setState((current) => ({ ...current, loading: true, error: "" }));
        try {
            const { data } = await api.get(endpoint, { params: { page, limit: PAGE_SIZE, ...JSON.parse(query) } });
            if (currentRequest !== requestVersion.current) return;
            const totalKey = `total${key[0].toUpperCase()}${key.slice(1)}`;
            if (!data[key].length && page > 1) return setPage(page - 1);
            setState({ items: data[key], total: data[totalKey], totalPages: Math.max(data.totalPages, 1), loading: false, error: "" });
        } catch (error) {
            if (currentRequest !== requestVersion.current) return;
            setState((current) => ({ ...current, loading: false, error: getApiError(error) }));
        }
    }, [endpoint, key, page, query]);

    useEffect(() => {
        void Promise.resolve().then(load);
        return () => {
            requestVersion.current += 1;
        };
    }, [load, version]);

    return { ...state, page, setPage };
}

// Runs a change, shows the outcome, and tells the dashboard to refresh.
function useAction(onChange) {
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const run = async (action, successMessage) => {
        setNotice("");
        setError("");
        setBusy(true);
        try {
            await action();
            setNotice(successMessage);
            onChange();
            return true;
        } catch (requestError) {
            setError(getApiError(requestError));
            return false;
        } finally {
            setBusy(false);
        }
    };
    return { notice, error, busy, run, setError };
}

function Messages({ error, notice }) {
    return (
        <>
            {error && <p className="dashboard-message dashboard-message-error" role="alert">{error}</p>}
            {notice && <p className="dashboard-message" role="status">{notice}</p>}
        </>
    );
}

function Pager({ page, totalPages, total, setPage, noun }) {
    return (
        <div className="admin-pager">
            <span>{total} {noun}{total === 1 ? "" : "s"}</span>
            {totalPages > 1 && (
                <>
                    <button className="seller-add-link" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button className="seller-add-link" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
                </>
            )}
        </div>
    );
}

function Filter({ label, value, onChange, options }) {
    return (
        <label className="admin-filter">
            {label}
            <select value={value} onChange={(event) => onChange(event.target.value)}>
                {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
            </select>
        </label>
    );
}

const bind = (setDraft, field) => ({
    onChange: (event) => setDraft((draft) => ({ ...draft, [field]: event.target.value })),
});

// ---------------------------------------------------------------- Members

const emptyUser = { name: "", email: "", role: "buyer", password: "", shopName: "", shippingAddress: "" };

export function UsersManager({ version, onChange }) {
    const { user: me } = useAuth();
    const [role, setRole] = useState("");
    const list = usePagedList("/admin/user", "users", role ? { role } : {}, version);
    const { notice, error, busy, run } = useAction(onChange);
    const [editing, setEditing] = useState(null); // null = closed, "new", or a user id
    const [draft, setDraft] = useState(emptyUser);

    const open = (member) => {
        setEditing(member ? member._id : "new");
        setDraft(member ? {
            name: member.name,
            email: member.emailID,
            role: member.role,
            password: "",
            shopName: member.shopName || "",
            shippingAddress: member.shippingAddress || "",
        } : emptyUser);
    };

    const submit = async (event) => {
        event.preventDefault();
        const { password, ...fields } = draft;
        const body = { ...fields, ...(password ? { password } : {}) };
        const saved = await run(
            () => (editing === "new" ? api.post("/admin/user", body) : api.put(`/admin/user/${editing}`, body)),
            editing === "new" ? `${draft.name} was added.` : `${draft.name} was updated.`,
        );
        if (saved) setEditing(null);
    };

    const remove = (member) => {
        if (!window.confirm(`Delete ${member.name}? Their cart is removed and any listings are hidden. Past orders are kept.`)) return;
        run(() => api.delete(`/admin/user/${member._id}`), `${member.name} was deleted.`);
    };

    const toggleActive = (member) =>
        run(
            () => api.put(`/admin/user/${member._id}/${member.isActive ? "deactivate" : "activate"}`),
            `${member.name} was ${member.isActive ? "deactivated" : "reactivated"}.`,
        );

    const isSelf = (member) => String(member._id) === String(me?.id);

    return (
        <section className="dashboard-panel" id="manage-members">
            <div className="panel-heading">
                <div><p className="dashboard-kicker">Community</p><h2>Members.</h2></div>
                <button className="seller-add-link" onClick={() => (editing ? setEditing(null) : open(null))}>{editing ? "Close" : "+ Add a member"}</button>
            </div>
            <Messages error={error || list.error} notice={notice} />
            {editing && (
                <form className="seller-product-form" onSubmit={submit}>
                    <label>Name<input required minLength="2" maxLength="80" value={draft.name} {...bind(setDraft, "name")} /></label>
                    <label>Email<input required type="email" value={draft.email} {...bind(setDraft, "email")} /></label>
                    <label>Role
                        <select value={draft.role} disabled={editing !== "new" && isSelf({ _id: editing })} {...bind(setDraft, "role")}>
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>
                    <label>{editing === "new" ? "Password" : "New password (optional)"}
                        <input
                            type="password"
                            autoComplete="new-password"
                            required={editing === "new"}
                            minLength="8"
                            maxLength="72"
                            pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
                            title="At least 8 characters, with a letter and a number"
                            placeholder={editing === "new" ? "8+ characters, a letter and a number" : "Leave blank to keep"}
                            value={draft.password}
                            {...bind(setDraft, "password")}
                        />
                    </label>
                    {draft.role === "seller" && <label className="seller-form-wide">Shop name<input maxLength="80" value={draft.shopName} {...bind(setDraft, "shopName")} /></label>}
                    <label className="seller-form-wide">Shipping address<input maxLength="300" value={draft.shippingAddress} {...bind(setDraft, "shippingAddress")} /></label>
                    <button className="panel-button" disabled={busy}>{busy ? "Saving…" : editing === "new" ? "Add member" : "Save changes"}</button>
                </form>
            )}
            <Filter label="Show" value={role} onChange={(value) => { setRole(value); list.setPage(1); }} options={[["", "All members"], ["buyer", "Buyers"], ["seller", "Sellers"], ["admin", "Admins"]]} />
            {list.loading && !list.items.length ? <p className="dashboard-message">Loading members…</p> : (
                <div className="seller-listings">
                    {list.items.map((member) => (
                        <div className="seller-listing" key={member._id}>
                            <span>{member.role[0].toUpperCase()}</span>
                            <div>
                                <strong>{member.name}{isSelf(member) ? " (you)" : ""}</strong>
                                <p>{member.role} · {member.emailID}{member.shopName ? ` · ${member.shopName}` : ""} · {member.isActive ? "Active" : "Deactivated"}</p>
                            </div>
                            <button onClick={() => open(member)}>Edit</button>
                            {member.role !== "admin" && <button onClick={() => toggleActive(member)}>{member.isActive ? "Deactivate" : "Reactivate"}</button>}
                            {member.role !== "admin" && !isSelf(member) && <button onClick={() => remove(member)}>Delete</button>}
                        </div>
                    ))}
                    {!list.items.length && <p className="dashboard-message">No members match this filter.</p>}
                </div>
            )}
            <Pager {...list} noun="member" />
        </section>
    );
}

// ---------------------------------------------------------------- Listings

const emptyProduct = { sellerID: "", name: "", category: "", price: "", stock: "", description: "", imageUrl: "", isActive: "true" };

export function ProductsManager({ version, onChange }) {
    const [status, setStatus] = useState("");
    const list = usePagedList("/admin/product", "products", status ? { isActive: status } : {}, version);
    const { notice, error, busy, run, setError } = useAction(onChange);
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState(emptyProduct);
    const [sellers, setSellers] = useState([]);

    const open = async (product) => {
        setEditing(product ? product._id : "new");
        setDraft(product ? {
            sellerID: product.sellerID?._id || "",
            name: product.name,
            category: product.category,
            price: String(product.price),
            stock: String(product.stock),
            description: product.description || "",
            imageUrl: product.imageUrl || "",
            isActive: String(product.isActive),
        } : emptyProduct);
        if (!product) {
            try {
                const { data } = await api.get("/admin/user", { params: { role: "seller", limit: 100 } });
                setSellers(data.users);
            } catch (requestError) {
                setError(getApiError(requestError));
            }
        }
    };

    const submit = async (event) => {
        event.preventDefault();
        const { sellerID, imageUrl, isActive, ...fields } = draft;
        const body = {
            ...fields,
            price: Number(fields.price),
            stock: Number(fields.stock),
            ...(imageUrl ? { imageUrl } : {}),
            ...(editing === "new" ? { sellerID } : { isActive: isActive === "true" }),
        };
        const saved = await run(
            () => (editing === "new" ? api.post("/admin/product", body) : api.put(`/admin/product/${editing}`, body)),
            editing === "new" ? `${draft.name} was added.` : `${draft.name} was updated.`,
        );
        if (saved) setEditing(null);
    };

    const toggleActive = (product) =>
        run(
            () => api.put(`/admin/product/${product._id}`, { isActive: !product.isActive }),
            `${product.name} was ${product.isActive ? "deactivated" : "reactivated"}.`,
        );

    const remove = (product) => {
        if (!window.confirm(`Delete ${product.name} permanently? It's removed from every bag. Past orders keep their copy.`)) return;
        run(() => api.delete(`/admin/product/${product._id}`), `${product.name} was deleted.`);
    };

    return (
        <section className="dashboard-panel" id="manage-listings">
            <div className="panel-heading">
                <div><p className="dashboard-kicker">Marketplace</p><h2>Listings.</h2></div>
                <button className="seller-add-link" onClick={() => (editing ? setEditing(null) : open(null))}>{editing ? "Close" : "+ Add a listing"}</button>
            </div>
            <Messages error={error || list.error} notice={notice} />
            {editing && (
                <form className="seller-product-form" onSubmit={submit}>
                    {editing === "new" ? (
                        <label className="seller-form-wide">Seller
                            <select required value={draft.sellerID} {...bind(setDraft, "sellerID")}>
                                <option value="">Choose a seller…</option>
                                {sellers.map((seller) => <option key={seller._id} value={seller._id}>{seller.shopName || seller.name} ({seller.emailID}){seller.isActive ? "" : " · deactivated"}</option>)}
                            </select>
                        </label>
                    ) : (
                        <label className="seller-form-wide">Visibility
                            <select value={draft.isActive} {...bind(setDraft, "isActive")}>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </label>
                    )}
                    <label>Product name<input required minLength="3" maxLength="80" value={draft.name} {...bind(setDraft, "name")} /></label>
                    <label>Category<input required minLength="2" maxLength="40" value={draft.category} {...bind(setDraft, "category")} placeholder="Ceramics" /></label>
                    <label>Price<input required type="number" min="0.01" max="1000000" step="0.01" value={draft.price} {...bind(setDraft, "price")} /></label>
                    <label>Stock<input required type="number" min="0" max="1000000" step="1" value={draft.stock} {...bind(setDraft, "stock")} /></label>
                    <label className="seller-form-wide">Description<input maxLength="1000" value={draft.description} {...bind(setDraft, "description")} /></label>
                    <label className="seller-form-wide">Image URL<input type="url" value={draft.imageUrl} {...bind(setDraft, "imageUrl")} placeholder="https://…" /></label>
                    <button className="panel-button" disabled={busy}>{busy ? "Saving…" : editing === "new" ? "Add listing" : "Save changes"}</button>
                </form>
            )}
            <Filter label="Show" value={status} onChange={(value) => { setStatus(value); list.setPage(1); }} options={[["", "All listings"], ["true", "Active"], ["false", "Inactive"]]} />
            {list.loading && !list.items.length ? <p className="dashboard-message">Loading listings…</p> : (
                <div className="seller-listings">
                    {list.items.map((product) => (
                        <div className="seller-listing" key={product._id}>
                            {product.imageUrl ? <img className="seller-listing-photo" src={product.imageUrl} alt="" /> : <span>✳</span>}
                            <div>
                                <strong>{product.name}</strong>
                                <p>
                                    {formatPrice(product.price)} · {product.stock} in stock · {product.category} · by {product.sellerID?.shopName || product.sellerID?.name || "a removed seller"} · {product.isActive ? "Active" : "Inactive"}
                                    {product.sellerSuspended ? " · hidden (seller deactivated)" : ""}
                                </p>
                            </div>
                            <button onClick={() => open(product)}>Edit</button>
                            <button onClick={() => toggleActive(product)}>{product.isActive ? "Deactivate" : "Activate"}</button>
                            <button onClick={() => remove(product)}>Delete</button>
                        </div>
                    ))}
                    {!list.items.length && <p className="dashboard-message">No listings match this filter.</p>}
                </div>
            )}
            <Pager {...list} noun="listing" />
        </section>
    );
}

// ---------------------------------------------------------------- Orders

const emptyAddress = { name: "", email: "", street: "", city: "", postcode: "" };
const emptyOrder = { buyerID: "", lines: [{ productID: "", qty: "1" }], ...emptyAddress, paymentMode: "COD", status: "placed", paymentStatus: "pending", deliveryDate: "" };

const orderTotal = (order) => order.items.reduce((sum, item) => sum + item.price * item.qty, 0);

export function OrdersManager({ version, onChange }) {
    const [status, setStatus] = useState("");
    const list = usePagedList("/admin/order", "orders", status ? { status } : {}, version);
    const { notice, error, busy, run, setError } = useAction(onChange);
    const [editing, setEditing] = useState(null);
    const [original, setOriginal] = useState(null);
    const [draft, setDraft] = useState(emptyOrder);
    const [buyers, setBuyers] = useState([]);
    const [products, setProducts] = useState([]);

    const open = async (order) => {
        setEditing(order ? order._id : "new");
        setOriginal(order);
        setDraft(order ? {
            ...emptyOrder,
            ...order.shippingAddress,
            status: order.status,
            paymentStatus: order.paymentStatus,
            deliveryDate: order.deliveryDate ? order.deliveryDate.slice(0, 10) : "",
        } : emptyOrder);
        if (!order) {
            try {
                const [buyerResponse, productResponse] = await Promise.all([
                    api.get("/admin/user", { params: { role: "buyer", isActive: "true", limit: 100 } }),
                    api.get("/admin/product", { params: { isActive: "true", limit: 100 } }),
                ]);
                setBuyers(buyerResponse.data.users);
                setProducts(productResponse.data.products.filter((product) => !product.sellerSuspended && product.stock > 0));
            } catch (requestError) {
                setError(getApiError(requestError));
            }
        }
    };

    const chooseBuyer = (buyerID) => {
        const buyer = buyers.find((candidate) => candidate._id === buyerID);
        setDraft((current) => ({
            ...current,
            buyerID,
            name: current.name || buyer?.name || "",
            email: current.email || buyer?.emailID || "",
        }));
    };

    const setLine = (index, field, value) =>
        setDraft((current) => ({
            ...current,
            lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, [field]: value } : line)),
        }));

    const newOrderTotal = draft.lines.reduce((sum, line) => {
        const product = products.find((candidate) => candidate._id === line.productID);
        return sum + (product ? product.price * Number(line.qty || 0) : 0);
    }, 0);

    const submit = async (event) => {
        event.preventDefault();
        const shippingAddress = { name: draft.name, email: draft.email, street: draft.street, city: draft.city, postcode: draft.postcode };
        const body = editing === "new"
            ? {
                buyerID: draft.buyerID,
                items: draft.lines.map((line) => ({ productID: line.productID, qty: Number(line.qty) })),
                shippingAddress,
                paymentMode: draft.paymentMode,
                status: draft.status,
                paymentStatus: draft.paymentStatus,
            }
            : { shippingAddress, status: draft.status, paymentStatus: draft.paymentStatus, deliveryDate: draft.deliveryDate || null };
        const saved = await run(
            () => (editing === "new" ? api.post("/admin/order", body) : api.put(`/admin/order/${editing}`, body)),
            editing === "new" ? "The order was created." : `Order ${String(editing).slice(-8)} was updated.`,
        );
        if (saved) setEditing(null);
    };

    const remove = (order) => {
        const restock = ["placed", "processing", "shipped"].includes(order.status) ? " Its items go back into stock." : "";
        if (!window.confirm(`Delete order ${String(order._id).slice(-8)} permanently?${restock}`)) return;
        run(() => api.delete(`/admin/order/${order._id}`), `Order ${String(order._id).slice(-8)} was deleted.`);
    };

    // Cancelled is final and delivered orders can't be cancelled, matching the API.
    const statusOptions = editing === "new"
        ? ORDER_STATUSES.filter((option) => option !== "cancelled")
        : original?.status === "cancelled"
            ? ["cancelled"]
            : ORDER_STATUSES.filter((option) => !(original?.status === "delivered" && option === "cancelled"));

    return (
        <section className="dashboard-panel" id="manage-orders">
            <div className="panel-heading">
                <div><p className="dashboard-kicker">Fulfilment</p><h2>Orders.</h2></div>
                <button className="seller-add-link" onClick={() => (editing ? setEditing(null) : open(null))}>{editing ? "Close" : "+ Create an order"}</button>
            </div>
            <Messages error={error || list.error} notice={notice} />
            {editing && (
                <form className="seller-product-form" onSubmit={submit}>
                    {editing === "new" && (
                        <>
                            <label className="seller-form-wide">Buyer
                                <select required value={draft.buyerID} onChange={(event) => chooseBuyer(event.target.value)}>
                                    <option value="">Choose a buyer…</option>
                                    {buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyer.name} ({buyer.emailID})</option>)}
                                </select>
                            </label>
                            {draft.lines.map((line, index) => (
                                <div className="seller-form-wide admin-order-line" key={index}>
                                    <label>Item {index + 1}
                                        <select required value={line.productID} onChange={(event) => setLine(index, "productID", event.target.value)}>
                                            <option value="">Choose a product…</option>
                                            {products.map((product) => (
                                                <option
                                                    key={product._id}
                                                    value={product._id}
                                                    disabled={draft.lines.some((other, otherIndex) => otherIndex !== index && other.productID === product._id)}
                                                >
                                                    {product.name} · {formatPrice(product.price)} · {product.stock} left
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>Qty<input required type="number" min="1" step="1" max={products.find((product) => product._id === line.productID)?.stock} value={line.qty} onChange={(event) => setLine(index, "qty", event.target.value)} /></label>
                                    {draft.lines.length > 1 && (
                                        <button type="button" className="seller-add-link" onClick={() => setDraft((current) => ({ ...current, lines: current.lines.filter((_, lineIndex) => lineIndex !== index) }))}>Remove</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="seller-add-link seller-form-wide admin-add-line" onClick={() => setDraft((current) => ({ ...current, lines: [...current.lines, { productID: "", qty: "1" }] }))}>+ Add another item</button>
                            <label>Payment method
                                <select value={draft.paymentMode} {...bind(setDraft, "paymentMode")}>
                                    {PAYMENT_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                                </select>
                            </label>
                        </>
                    )}
                    <label>Status
                        <select value={draft.status} disabled={original?.status === "cancelled"} {...bind(setDraft, "status")}>
                            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </label>
                    <label>Payment status
                        <select value={draft.paymentStatus} {...bind(setDraft, "paymentStatus")}>
                            {PAYMENT_STATUSES.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </label>
                    {editing !== "new" && <label>Delivery date<input type="date" value={draft.deliveryDate} {...bind(setDraft, "deliveryDate")} /></label>}
                    <label>Recipient name<input required minLength="2" maxLength="80" value={draft.name} {...bind(setDraft, "name")} /></label>
                    <label>Recipient email<input required type="email" value={draft.email} {...bind(setDraft, "email")} /></label>
                    <label className="seller-form-wide">Street<input required minLength="3" maxLength="160" value={draft.street} {...bind(setDraft, "street")} /></label>
                    <label>City<input required minLength="2" maxLength="80" value={draft.city} {...bind(setDraft, "city")} /></label>
                    <label>Postcode<input required minLength="3" maxLength="20" value={draft.postcode} {...bind(setDraft, "postcode")} /></label>
                    {editing !== "new" && draft.status === "cancelled" && original?.status !== "cancelled" && (
                        <p className="dashboard-message seller-form-wide">Cancelling puts this order’s items back into stock. It can’t be reopened afterwards.</p>
                    )}
                    <button className="panel-button" disabled={busy}>
                        {busy ? "Saving…" : editing === "new" ? `Create order · ${formatPrice(newOrderTotal)}` : "Save changes"}
                    </button>
                </form>
            )}
            <Filter label="Show" value={status} onChange={(value) => { setStatus(value); list.setPage(1); }} options={[["", "All orders"], ...ORDER_STATUSES.map((option) => [option, option[0].toUpperCase() + option.slice(1)])]} />
            {list.loading && !list.items.length ? <p className="dashboard-message">Loading orders…</p> : (
                <div className="seller-listings">
                    {list.items.map((order) => (
                        <div className="seller-listing" key={order._id}>
                            <span>↗</span>
                            <div>
                                <strong>Order {String(order._id).slice(-8)} · {order.buyerID?.name || "a removed buyer"}</strong>
                                <p>
                                    {new Date(order.orderDate).toLocaleDateString()} · {order.items.map((item) => `${item.productName} × ${item.qty}`).join(", ")} · {formatPrice(orderTotal(order))} · {order.paymentMode} ({order.paymentStatus})
                                    {order.deliveryDate ? ` · delivered ${new Date(order.deliveryDate).toLocaleDateString()}` : ""}
                                </p>
                            </div>
                            <span className="listing-status">{order.status}</span>
                            <button onClick={() => open(order)}>Edit</button>
                            <button onClick={() => remove(order)}>Delete</button>
                        </div>
                    ))}
                    {!list.items.length && <p className="dashboard-message">No orders match this filter.</p>}
                </div>
            )}
            <Pager {...list} noun="order" />
        </section>
    );
}
