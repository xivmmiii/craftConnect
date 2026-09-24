import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ProductGrid } from "./Marketplace.jsx";
import { formatPrice } from "../utils/formatPrice.js";

export default function BuyerDashboard() {
    const { user, orders, cart } = useAuth();
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
                <div>
                    <span>Items in your bag</span>
                    <strong>{String(cart.reduce((sum, item) => sum + item.quantity, 0)).padStart(2, "0")}</strong>
                </div>
                <div>
                    <span>Order spend</span>
                    <strong>{formatPrice(orders.reduce((sum, order) => sum + order.items.reduce((itemsTotal, item) => itemsTotal + item.price * item.qty, 0), 0))}</strong>
                </div>
            </div>
            <section className="dashboard-panel">
                <div className="panel-heading">
                    <div>
                        <p className="dashboard-kicker">Picked with care</p>
                        <h2>Made for keeping.</h2>
                    </div>
                    <Link to="/products">
                        Shop all <span>↗</span>
                    </Link>
                </div>
                <ProductGrid compact />
            </section>
            <section className="dashboard-panel" id="orders">
                <div className="panel-heading">
                    <div>
                        <p className="dashboard-kicker">Coming your way</p>
                        <h2>Your orders.</h2>
                    </div>
                </div>
                {orders.length ? (
                    orders.map((order) => (
                        <div className="product-placeholder" key={order._id}>
                            <span>✳</span>
                            <div>
                                <strong>Order {String(order._id).slice(-8)}</strong>
                                <p>
                                    {new Date(order.orderDate).toLocaleDateString()} · {order.status} · {formatPrice(order.items.reduce((sum, item) => sum + item.price * item.qty, 0))}
                                </p>
                            </div>
                        </div>
                    ))
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
