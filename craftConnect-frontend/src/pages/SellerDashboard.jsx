import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api, { getApiError } from "../services/api.js";
import useProducts from "../hooks/useProducts.js";
import { formatPrice } from "../utils/formatPrice.js";

const initialDraft = {
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    imageUrl: "",
};

export default function SellerDashboard() {
    const { orders } = useAuth();
    const { products, loading, error, refresh } = useProducts({ seller: true });
    const [draft, setDraft] = useState(initialDraft);
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const formRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [requestError, setRequestError] = useState("");
    const activeCount = products.filter((product) => product.isActive).length;
    const showEmptyState = !formOpen && !loading && !error && products.length === 0;

    const submitListing = async (event) => {
        event.preventDefault();
        setSaving(true);
        setRequestError("");
        setNotice("");
        try {
            const { imageUrl, ...productFields } = draft;
            const body = {
                ...productFields,
                ...(imageUrl ? { imageUrl } : {}),
                price: Number(draft.price),
                stock: Number(draft.stock),
            };
            if (editingId) await api.put(`/product/${editingId}`, body);
            else await api.post("/product", body);
            closeForm();
            setNotice(
                editingId
                    ? "Your listing is updated."
                    : "Your listing is live.",
            );
            await refresh();
        } catch (err) {
            setRequestError(getApiError(err));
        } finally {
            setSaving(false);
        }
    };

    const closeForm = () => {
        setDraft(initialDraft);
        setEditingId(null);
        setFormOpen(false);
    };

    const editListing = (product) => {
        setRequestError("");
        setNotice("");
        setEditingId(product._id);
        setDraft({
            name: product.name,
            description: product.description || "",
            category: product.category,
            price: String(product.price),
            stock: String(product.stock),
            imageUrl: product.imageUrl || "",
        });
        setFormOpen(true);
        requestAnimationFrame(() =>
            formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            }),
        );
    };

    const deactivateListing = async (id) => {
        setRequestError("");
        try {
            await api.delete(`/product/${id}`);
            setNotice("Listing removed from your shop.");
            await refresh();
        } catch (err) {
            setRequestError(getApiError(err));
        }
    };

    return (
        <div className="dashboard-content">
            <p className="dashboard-kicker">Your maker studio</p>
            <h1>
                Make a little <em>room.</em>
            </h1>
            <p className="dashboard-intro">
                A home for your work, your shop, and the people who love what
                you make.
            </p>
            <div className="dashboard-stats">
                <div>
                    <span>Active listings</span>
                    <strong>{String(activeCount).padStart(2, "0")}</strong>
                </div>
                <div>
                    <span>Orders to fulfill</span>
                    <strong>
                        {String(
                            orders.filter(
                                (order) =>
                                    order.status === "placed" ||
                                    order.status === "processing",
                            ).length,
                        ).padStart(2, "0")}
                    </strong>
                </div>
            </div>

            <section className="dashboard-panel" id="insights">
                <div className="panel-heading">
                    <div>
                        <p className="dashboard-kicker">
                            Your little storefront
                        </p>
                        <h2>Made by you.</h2>
                    </div>
                    {/* The empty-state box below has its own "Add a listing" button. */}
                    {!showEmptyState && (
                        <button
                            className="seller-add-link"
                            onClick={() => {
                                setRequestError("");
                                if (formOpen) closeForm();
                                else setFormOpen(true);
                            }}
                        >
                            {formOpen ? "Close" : "+ Add a listing"}
                        </button>
                    )}
                </div>
                {requestError && (
                    <p
                        className="dashboard-message dashboard-message-error"
                        role="alert"
                    >
                        {requestError}
                    </p>
                )}
                {notice && (
                    <p className="dashboard-message" role="status">
                        {notice}
                    </p>
                )}
                {formOpen && (
                    <form
                        className="seller-product-form"
                        onSubmit={submitListing}
                        ref={formRef}
                    >
                        <label>
                            Product name
                            <input
                                required
                                minLength="3"
                                maxLength="80"
                                value={draft.name}
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        name: event.target.value,
                                    })
                                }
                            />
                        </label>
                        <label>
                            Category
                            <input
                                required
                                minLength="2"
                                maxLength="40"
                                value={draft.category}
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        category: event.target.value,
                                    })
                                }
                                placeholder="Ceramics"
                            />
                        </label>
                        <label>
                            Price
                            <input
                                required
                                type="number"
                                min="0.01"
                                max="1000000"
                                step="0.01"
                                value={draft.price}
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        price: event.target.value,
                                    })
                                }
                            />
                        </label>
                        <label>
                            Stock
                            <input
                                required
                                type="number"
                                min="0"
                                max="1000000"
                                step="1"
                                value={draft.stock}
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        stock: event.target.value,
                                    })
                                }
                            />
                        </label>
                        <label className="seller-form-wide">
                            Description
                            <input
                                maxLength="1000"
                                value={draft.description}
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        description: event.target.value,
                                    })
                                }
                            />
                        </label>
                        <label className="seller-form-wide">
                            Image URL
                            <input
                                type="url"
                                value={draft.imageUrl}
                                onChange={(event) =>
                                    setDraft({
                                        ...draft,
                                        imageUrl: event.target.value,
                                    })
                                }
                                placeholder="https://…"
                            />
                        </label>
                        <button className="panel-button" disabled={saving}>
                            {saving
                                ? editingId
                                    ? "Saving…"
                                    : "Publishing…"
                                : editingId
                                  ? "Save changes"
                                  : "Publish listing"}
                        </button>
                    </form>
                )}
                {/* While adding or editing, the form takes the list's place. */}
                {formOpen ? null : loading ? (
                    <p className="dashboard-message">Loading your listings…</p>
                ) : error ? (
                    <p
                        className="dashboard-message dashboard-message-error"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : products.length ? (
                    <div className="seller-listings">
                        {products.map((product) => (
                            <div className="seller-listing" key={product._id}>
                                {product.imageUrl ? (
                                    <img
                                        className="seller-listing-photo"
                                        src={product.imageUrl}
                                        alt=""
                                    />
                                ) : (
                                    <span>✳</span>
                                )}
                                <div>
                                    <strong>{product.name}</strong>
                                    <p>
                                        {formatPrice(product.price)} ·{" "}
                                        {product.stock} in stock ·{" "}
                                        {product.category} ·{" "}
                                        {product.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </p>
                                </div>
                                {product.isActive && (
                                    <button
                                        onClick={() => editListing(product)}
                                    >
                                        Edit
                                    </button>
                                )}
                                {product.isActive && (
                                    <button
                                        onClick={() =>
                                            deactivateListing(product._id)
                                        }
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="product-placeholder">
                        <span>＋</span>
                        <div>
                            <strong>
                                Your first listing starts with a story.
                            </strong>
                            <p>
                                Add the piece you’re proudest of and give your
                                shop a beginning.
                            </p>
                        </div>
                        <button
                            className="panel-button"
                            onClick={() => setFormOpen(true)}
                        >
                            Add a listing
                        </button>
                    </div>
                )}
            </section>

            <section className="dashboard-panel" id="orders">
                <div className="panel-heading">
                    <div>
                        <p className="dashboard-kicker">On the way</p>
                        <h2>Orders to fulfill.</h2>
                    </div>
                </div>
                {orders.length ? (
                    <div className="seller-listings">
                        {orders.map((order) => {
                            const items = order.items; // the API returns only this seller's lines
                            return (
                                <div className="seller-listing" key={order._id}>
                                    <span>↗</span>
                                    <div>
                                        <strong>
                                            Order {String(order._id).slice(-8)}
                                        </strong>
                                        <p>
                                            {items
                                                .map(
                                                    (item) =>
                                                        `${item.productName} × ${item.qty}`,
                                                )
                                                .join(" · ")}{" "}
                                            ·{" "}
                                            {new Date(
                                                order.orderDate,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="listing-status">
                                        {order.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="product-placeholder">
                        <span>↗</span>
                        <div>
                            <strong>No orders to pack yet.</strong>
                            <p>
                                Orders that include your work will appear here.
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
