import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils/formatPrice.js";

const orderTotal = (order) =>
    order.items.reduce((sum, item) => sum + item.price * item.qty, 0);

function OrderDetails({ order }) {
    const address = order.shippingAddress;
    return (
        <div className="order-details" id={`order-details-${order._id}`}>
            <div className="seller-listings">
                {order.items.map((item) => (
                    <div className="seller-listing" key={item._id || item.productID?._id || item.productID}>
                        {item.productID?.imageUrl ? (
                            <img className="seller-listing-photo" src={item.productID.imageUrl} alt="" />
                        ) : (
                            <span>✳</span>
                        )}
                        <div>
                            <strong>{item.productName}</strong>
                            <p>
                                Qty {item.qty} × {formatPrice(item.price)}
                            </p>
                        </div>
                        <span className="listing-status">{formatPrice(item.price * item.qty)}</span>
                    </div>
                ))}
            </div>
            <div className="order-details-meta">
                <div>
                    <span>Total</span>
                    {formatPrice(orderTotal(order))}
                </div>
                <div>
                    <span>Payment</span>
                    {order.paymentMode} · {order.paymentStatus}
                </div>
                <div>
                    <span>{order.deliveryDate ? "Delivered" : "Status"}</span>
                    {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString()
                        : order.status}
                </div>
                {address && (
                    <div>
                        <span>Shipping to</span>
                        {address.name}, {address.street}, {address.city} {address.postcode}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BuyerDashboard() {
    const { user, orders } = useAuth();
    const [openOrderId, setOpenOrderId] = useState(null);
    return (
        <div className="dashboard-content">
            <p className="dashboard-kicker">Your little corner</p>
            <h1>
                Hello, <em>{user?.name?.split(" ")[0] || "friend"}.</em>
            </h1>
            <p className="dashboard-intro">
                A good place to find something with a story, or remember a find
                you already love.
            </p>
            <div className="dashboard-stats">
                <div>
                    <span>Orders placed</span>
                    <strong>{String(orders.length).padStart(2, "0")}</strong>
                </div>

            </div>
            <section className="dashboard-panel" id="orders">
                <div className="panel-heading">
                    <div>
                        <p className="dashboard-kicker">Coming your way</p>
                        <h2>Your orders.</h2>
                    </div>
                </div>
                {orders.length ? (
                    orders.map((order) => {
                        const open = openOrderId === order._id;
                        return (
                            <div className="order-card-wrap" key={order._id}>
                                <button
                                    type="button"
                                    className="product-placeholder order-card"
                                    aria-expanded={open}
                                    aria-controls={`order-details-${order._id}`}
                                    onClick={() => setOpenOrderId(open ? null : order._id)}
                                >
                                    <span>✳</span>
                                    <div>
                                        <strong>Order {String(order._id).slice(-8)}</strong>
                                        <p>
                                            {new Date(order.orderDate).toLocaleDateString()} · {order.status} · {formatPrice(orderTotal(order))}
                                        </p>
                                    </div>
                                    <small className="order-card-toggle">
                                        {open ? "Hide items ↑" : `View ${order.items.length} ${order.items.length === 1 ? "item" : "items"} ↓`}
                                    </small>
                                </button>
                                {open && <OrderDetails order={order} />}
                            </div>
                        );
                    })
                ) : (
                    <div className="product-placeholder">
                        <span>↗</span>
                        <div>
                            <strong>No orders just yet.</strong>
                            <p>
                                Your first lovely find is only a little browse
                                away.
                            </p>
                        </div>
                        <Link to="/products" className="panel-button">
                            Explore
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
