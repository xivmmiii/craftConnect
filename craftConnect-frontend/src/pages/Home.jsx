import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProductGrid } from "./Marketplace.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import "./Home.css";

const categories = [
    { label: "Home decor", icon: "✦", tone: "blue" },
    { label: "Wearable art", icon: "◌", tone: "clay" },
    { label: "Natural beauty", icon: "❋", tone: "sage" },
];

export default function Home() {
    const { user, logout, cart } = useAuth();
    const bagCount = cart.reduce((count, item) => count + item.quantity, 0);
    const dashboardPath =
        user?.role === "seller"
            ? "/seller"
            : user?.role === "admin"
              ? "/admin"
              : "/buyer";

    return (
        <div className="home-page">
            <nav className="site-nav">
                <Link className="brand" to="/">
                    <span className="brand-mark">cc</span>
                    <span>
                        craft<span>connect</span>
                    </span>
                </Link>
                <div className="nav-links">
                    <Link to="/products">Discover</Link>
                    <a href="#story">Our story</a>
                    <Link className="nav-bag" to="/cart">
                        Bag ↗
                    </Link>
                    {user ? (
                        <>
                            <Link className="user-pill" to={dashboardPath}>
                                <span className="status-dot" />
                                {user.name || user.role}
                            </Link>
                            <button className="nav-button" onClick={logout}>
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin">Log in</Link>
                            <Link className="nav-button" to="/signup">
                                Join the community
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <main>
                <section className="hero-section">
                    <div className="hero-copy">
                        <p className="eyebrow">
                            <span /> Made by hand. Found by heart.
                        </p>
                        <h1>
                            Things with a<br />
                            <em>story to tell.</em>
                        </h1>
                        <p className="hero-description">
                            A thoughtful marketplace for handmade goods,
                            small-batch treasures, and the people who make them.
                        </p>
                        <div className="hero-actions">
                            <Link
                                className="primary-button"
                                to={
                                    user?.role === "seller"
                                        ? "/my-products"
                                        : "/products"
                                }
                            >
                                Explore the collection <span>↗</span>
                            </Link>                           
                            {user?.role === "admin" && (
                                <Link className="text-button" to="/admin">
                                    Open admin <span>→</span>
                                </Link>
                            )}
                        </div>
                        <div className="hero-proof">
                            <div className="avatar-stack">
                                <span>M</span>
                                <span>J</span>
                                <span>A</span>
                                <span>+</span>
                            </div>
                            <p>
                                <strong>2,400+</strong> makers already creating
                                magic
                            </p>
                        </div>
                    </div>
                    <div
                        className="hero-art"
                        aria-label="Handmade ceramic vase"
                    >
                        <img className="hero-photo" src="https://images.unsplash.com/photo-1703289803868-46a991580783?auto=format&fit=crop&w=1600&q=90" alt="Handmade ceramic vase, photographed in a maker’s studio" fetchPriority="high" />
                        <div className="art-label">
                            01 <span>/</span> handpicked
                        </div>
                        <div className="hero-sticker">
                            made
                            <br />
                            <strong>slowly</strong>
                        </div>
                    </div>
                </section>

                <section className="featured-section" id="featured">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                <span /> Made by independent hands
                            </p>
                            <h2>Worth keeping.</h2>
                        </div>
                        <Link className="text-button" to="/products">
                            Shop the collection <span>→</span>
                        </Link>
                    </div>
                    <ProductGrid compact />
                </section>

                <section className="category-section" id="discover">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                <span /> Find your kind of lovely
                            </p>
                            <h2>Start with a feeling.</h2>
                        </div>
                        <p className="section-note">
                            Browse small wonders, thoughtfully
                            <br />
                            made for everyday living.
                        </p>
                    </div>
                    <div className="category-grid">
                        {categories.map((category) => (
                            <Link
                                className={`category-card ${category.tone}`}
                                to="/products"
                                key={category.label}
                            >
                                <span className="category-icon">
                                    {category.icon}
                                </span>
                                <span>{category.label}</span>
                                <span className="card-arrow">↗</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="story-section" id="story">
                    <div className="story-image"><img className="story-photo" src="https://images.unsplash.com/photo-1768734837394-182f596e84ac?auto=format&fit=crop&w=1000&q=85" alt="Handwoven bags displayed at an artisan market" loading="lazy" />
                        <div className="story-circle">
                            crafted
                            <br />
                            with care
                        </div>
                        <div className="story-clay" />
                    </div>
                    <div className="story-copy">
                        <p className="eyebrow">
                            <span /> The CraftConnect promise
                        </p>
                        <h2>
                            Good things take
                            <br />
                            <em>time.</em>
                        </h2>
                        <p>
                            We bring curious shoppers and independent makers
                            together, so every purchase feels a little more
                            personal.
                        </p>                      
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
