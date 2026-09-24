import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { products } from "../data/products.js";
import useProducts from "../hooks/useProducts.js";
import { getApiError } from "../services/api.js";
import SiteFooter from "../components/SiteFooter.jsx";
import "./Shop.css";
import { formatPrice } from "../utils/formatPrice.js";

export function ProductGrid({ compact = false, showBagQuantity = true }) {
    const { addToCart, updateQuantity, cart, user } = useAuth();
    const { products: listings, loading, error } = useProducts();
    const [notice, setNotice] = useState("");
    const [requestError, setRequestError] = useState("");
    const [pendingProductId, setPendingProductId] = useState("");
    const navigate = useNavigate();
    const changeQuantity = async (product, quantity) => {
        setNotice("");
        setRequestError("");
        setPendingProductId(product._id);
        try {
            await updateQuantity(product._id, quantity);
        } catch (error) {
            setRequestError(getApiError(error));
        } finally {
            setPendingProductId("");
        }
    };
    const addProduct = async (product) => {
        if (user?.role !== "buyer") {
            if (!user) navigate("/signin");
            else
                setRequestError(
                    "Shopping bags are available for buyer accounts.",
                );
            return;
        }
        setNotice("");
        setRequestError("");
        setPendingProductId(product._id);
        try {
            await addToCart(product);
            setNotice(`${product.name} added to your bag.`);
        } catch (error) {
            setRequestError(getApiError(error));
        } finally {
            setPendingProductId("");
        }
    };
    return (
        <div
            className={`product-grid ${compact ? "product-grid-compact" : ""}`}
        >
            {loading && (
                <p className="shop-state">Finding thoughtful things…</p>
            )}
            {!loading && error && (
                <p className="shop-state shop-state-error" role="alert">
                    {error}
                </p>
            )}
            {!loading && !error && listings.length === 0 && (
                <p className="shop-state">
                    Nothing in the collection just yet. Check back soon.
                </p>
            )}
            {listings.map((product, index) => {
                const quantity =
                    showBagQuantity && user?.role === "buyer"
                        ? cart.find((item) => item.id === product._id)
                              ?.quantity || 0
                        : 0;
                const pending = pendingProductId === product._id;
                return (
                    <article className="shop-card" key={product._id}>
                        <Link
                            to="/products"
                            className={`product-art ${product.art}`}
                            aria-label={`View ${product.name}`}
                        >
                            <img
                                className="product-photo"
                                src={
                                    product.imageUrl ||
                                    products[index % products.length].image
                                }
                                alt={product.name}
                                loading="lazy"
                            />
                            <span className="art-index">
                                0{index + 1} / made with care
                            </span>
                            <span className="art-orbit" />
                        </Link>
                        <div className="product-details">
                            <div>
                                <span className="product-maker">
                                    {product.sellerID?.shopName ||
                                        product.sellerID?.name ||
                                        "Independent maker"}{" "}
                                    · {product.category}
                                </span>
                                <h3>{product.name}</h3>
                            </div>
                            <strong>{formatPrice(product.price)}</strong>
                        </div>
                        {quantity > 0 ? (
                            <div
                                className="product-bag-quantity"
                                role="group"
                                aria-label={`${product.name} quantity in bag`}
                            >
                                <button
                                    type="button"
                                    aria-label={`Remove one ${product.name}`}
                                    disabled={pending}
                                    onClick={() =>
                                        changeQuantity(product, quantity - 1)
                                    }
                                >
                                    −
                                </button>
                                <span aria-live="polite">{quantity}</span>
                                <button
                                    type="button"
                                    aria-label={`Add one ${product.name}`}
                                    disabled={
                                        pending || quantity >= product.stock
                                    }
                                    onClick={() =>
                                        changeQuantity(product, quantity + 1)
                                    }
                                >
                                    ＋
                                </button>
                            </div>
                        ) : (
                            <button
                                className="add-button"
                                onClick={() => addProduct(product)}
                                disabled={product.stock < 1 || pending}
                            >
                                {product.stock < 1 ? "Sold out" : "Add to bag"}{" "}
                                <span>＋</span>
                            </button>
                        )}
                    </article>
                );
            })}
            {requestError && (
                <p className="shop-state shop-state-error" role="alert">
                    {requestError}
                </p>
            )}
            {notice && (
                <p className="shop-state" role="status">
                    {notice}
                </p>
            )}
        </div>
    );
}

export function ShopPage() {
    return (
        <div className="shop-page">
            <header className="shop-header">
                <Link className="shop-brand" to="/">
                    cc <span>craftconnect</span>
                </Link>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/cart">Bag ↗</Link>
                </nav>
            </header>
            <main className="shop-main">
                <p className="shop-kicker">A little something, made slowly</p>
                <h1>
                    Find your <em>forever favorite.</em>
                </h1>
                <p className="shop-lede">
                    Thoughtful objects, made in small batches by people who care
                    about the details.
                </p>
                <div className="shop-filter">
                    <span>THE COLLECTION — 04 FINDS</span>
                    <span>
                        Handmade, always <b>✳</b>
                    </span>
                </div>
                <ProductGrid />
            </main>
            <SiteFooter />
        </div>
    );
}

export function CartPage() {
    const { cart, updateQuantity, removeFromCart } = useAuth();
    const [error, setError] = useState("");
    const hasUnavailable = cart.some((item) => !item.available);
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    return (
        <div className="shop-page">
            <header className="shop-header">
                <Link className="shop-brand" to="/">
                    cc <span>craftconnect</span>
                </Link>
                <nav>
                    <Link to="/products">Keep exploring</Link>
                </nav>
            </header>
            <main className="shop-main cart-main">
                <p className="shop-kicker">Your little collection</p>
                <h1>
                    The <em>good stuff.</em>
                </h1>
                {error && (
                    <p className="shop-state shop-state-error" role="alert">
                        {error}
                    </p>
                )}
                {!cart.length ? (
                    <div className="empty-cart">
                        <span>✳</span>
                        <h2>Your bag is taking a breather.</h2>
                        <p>
                            There are lovely things out there waiting to be
                            found.
                        </p>
                        <Link className="shop-cta" to="/products">
                            Explore the collection <span>↗</span>
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {cart.map((item) => (
                                <article className="cart-item" key={item.id}>
                                    <div
                                        className={`product-art cart-art ${item.art}`}
                                    >
                                        <img
                                            className="product-photo"
                                            src={item.image}
                                            alt={item.name}
                                        />
                                    </div>
                                    <div className="cart-item-copy">
                                        <span className="product-maker">
                                            {item.maker}
                                        </span>
                                        <h3>{item.name}</h3>
                                        {!item.available && (
                                            <p className="shop-state shop-state-error">
                                                Unavailable:{" "}
                                                {item.unavailableReason}. Remove
                                                it or lower the quantity to
                                                check out.
                                            </p>
                                        )}
                                        <div className="quantity-control">
                                            <button
                                                aria-label="Remove one"
                                                onClick={async () => {
                                                    try {
                                                        setError("");
                                                        await updateQuantity(
                                                            item.id,
                                                            item.quantity - 1,
                                                        );
                                                    } catch (err) {
                                                        setError(
                                                            getApiError(err),
                                                        );
                                                    }
                                                }}
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                aria-label="Add one"
                                                onClick={async () => {
                                                    try {
                                                        setError("");
                                                        await updateQuantity(
                                                            item.id,
                                                            item.quantity + 1,
                                                        );
                                                    } catch (err) {
                                                        setError(
                                                            getApiError(err),
                                                        );
                                                    }
                                                }}
                                            >
                                                ＋
                                            </button>
                                        </div>
                                    </div>
                                    <div className="cart-item-price">
                                        <strong>
                                            {formatPrice(
                                                item.price * item.quantity,
                                            )}
                                        </strong>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setError("");
                                                    await removeFromCart(
                                                        item.id,
                                                    );
                                                } catch (err) {
                                                    setError(getApiError(err));
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <aside className="order-summary">
                            <p className="shop-kicker">The little details</p>
                            <h2>Order summary</h2>
                            <div>
                                <span>Subtotal</span>
                                <strong>{formatPrice(total)}</strong>
                            </div>
                            <div>
                                <span>Shipping</span>
                                <span>On us</span>
                            </div>
                            <div className="summary-total">
                                <span>Total</span>
                                <strong>{formatPrice(total)}</strong>
                            </div>
                            {hasUnavailable ? (
                                <p className="shop-state shop-state-error">
                                    Some items in your bag are unavailable.
                                    Update your bag to continue.
                                </p>
                            ) : (
                                <Link className="shop-cta" to="/checkout">
                                    Continue to checkout <span>↗</span>
                                </Link>
                            )}
                            <p className="summary-note">
                                Made by real people, packed with care.
                            </p>
                        </aside>
                    </div>
                )}
            </main>
            <SiteFooter />
        </div>
    );
}

export function CheckoutPage() {
    const { cart, placeOrder, user } = useAuth();
    const unavailable = cart.filter((item) => !item.available);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const submit = async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setError("");
        setLoading(true);
        try {
            const order = await placeOrder({
                paymentMode: "COD",
                shippingAddress: {
                    name: form.get("name"),
                    email: form.get("email"),
                    street: form.get("street"),
                    city: form.get("city"),
                    postcode: form.get("postcode"),
                },
            });
            navigate("/order-confirmation", { state: { order } });
        } catch (requestError) {
            setError(getApiError(requestError));
        } finally {
            setLoading(false);
        }
    };
    if (!cart.length)
        return (
            <div className="shop-page">
                <main className="shop-main empty-cart">
                    <p className="shop-kicker">Almost there</p>
                    <h1>
                        Your bag is <em>empty.</em>
                    </h1>
                    <Link className="shop-cta" to="/products">
                        Find your favorite ↗
                    </Link>
                </main>
                <SiteFooter />
            </div>
        );
    return (
        <div className="shop-page">
            <header className="shop-header">
                <Link className="shop-brand" to="/">
                    cc <span>craftconnect</span>
                </Link>
                <nav>
                    <Link to="/cart">← Back to your bag</Link>
                </nav>
            </header>
            <main className="shop-main checkout-main">
                <p className="shop-kicker">The final little details</p>
                <h1>
                    Make it <em>yours.</em>
                </h1>
                <div className="checkout-layout">
                    <form className="checkout-form" onSubmit={submit}>
                        <h2>Where should we send it?</h2>
                        <div className="form-two">
                            <label>
                                Your name
                                <input
                                    required
                                    name="name"
                                    defaultValue={user?.name || ""}
                                    placeholder="Alex Morgan"
                                />
                            </label>
                            <label>
                                Email address
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    defaultValue={
                                        user?.emailID || user?.email || ""
                                    }
                                    placeholder="alex@example.com"
                                />
                            </label>
                        </div>
                        <label>
                            Street address
                            <input
                                required
                                name="street"
                                placeholder="123 Maker Street"
                            />
                        </label>
                        <div className="form-two">
                            <label>
                                City
                                <input
                                    required
                                    name="city"
                                    placeholder="Brooklyn"
                                />
                            </label>
                            <label>
                                Postcode
                                <input
                                    required
                                    name="postcode"
                                    placeholder="11211"
                                />
                            </label>
                        </div>
                        <label>
                            Payment
                            <select name="paymentMode" value="COD" disabled>
                                <option value="COD">Pay on delivery</option>
                            </select>
                        </label>
                        {error && (
                            <p
                                className="shop-state shop-state-error"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                        {unavailable.length > 0 && (
                            <p
                                className="shop-state shop-state-error"
                                role="alert"
                            >
                                Unavailable:{" "}
                                {unavailable
                                    .map(
                                        (item) =>
                                            `${item.name} (${item.unavailableReason})`,
                                    )
                                    .join("; ")}
                                . <Link to="/cart">Update your bag</Link>
                            </p>
                        )}
                        <button
                            className="shop-cta"
                            disabled={loading || unavailable.length > 0}
                        >
                            {loading
                                ? "Placing your order…"
                                : `Place order · ${formatPrice(total)}`}{" "}
                            <span>↗</span>
                        </button>
                        <p className="summary-note">
                            Pay on delivery. Online payment is not enabled yet.
                        </p>
                    </form>
                    <aside className="order-summary">
                        <p className="shop-kicker">YOUR FINDS</p>
                        <h2>
                            {cart.length} thoughtful{" "}
                            {cart.length === 1 ? "thing" : "things"}
                        </h2>
                        {cart.map((item) => (
                            <div className="checkout-line" key={item.id}>
                                <span>
                                    {item.name} × {item.quantity}
                                </span>
                                <strong>
                                    {formatPrice(item.price * item.quantity)}
                                </strong>
                            </div>
                        ))}
                        <div className="summary-total">
                            <span>Total</span>
                            <strong>{formatPrice(total)}</strong>
                        </div>
                    </aside>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}

export function ConfirmationPage() {
    const { orders } = useAuth();
    const location = useLocation();
    const order = location.state?.order || orders[0];
    return (
        <div className="shop-page">
            <header className="shop-header">
                <Link className="shop-brand" to="/">
                    cc <span>craftconnect</span>
                </Link>
            </header>
            <main className="order-confirmation">
                <span className="confirmation-mark">✳</span>
                <p className="shop-kicker">A very good choice</p>
                <h1>
                    It’s <em>official.</em>
                </h1>
                <p>
                    Your order{" "}
                    {order ? (
                        <strong>
                            #{String(order._id || order.id).slice(-8)}
                        </strong>
                    ) : (
                        ""
                    )}{" "}
                    is in. Someone’s about to make a little something just for
                    you.
                </p>
                <Link className="shop-cta" to="/products">
                    Find another favorite <span>↗</span>
                </Link>
                <Link className="text-button" to="/buyer">
                    Back to your space →
                </Link>
            </main>
            <SiteFooter />
        </div>
    );
}
