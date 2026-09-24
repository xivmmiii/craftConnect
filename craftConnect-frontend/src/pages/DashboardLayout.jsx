import { startTransition } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import "./Dashboard.css";

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const home =
        user?.role === "seller"
            ? "/seller"
            : user?.role === "admin"
              ? "/admin"
              : "/buyer";

    const leave = () => {
        // Router navigations run as transitions; clearing the user in the same transition
        // renders both together, so the protected route can't redirect to /signin first.
        startTransition(() => {
            navigate("/");
            logout();
        });
    };

    return (
        <div className="dashboard-shell">
            <aside className="dashboard-sidebar">
                <Link className="dashboard-brand" to={home}>
                    <span>cc</span> craft<span>connect</span>
                </Link>
                <div className="profile-mini">
                    <span>{user?.role?.[0]?.toUpperCase()}</span>
                    <div>
                        <strong>{user?.role}</strong>
                        <small>CraftConnect member</small>
                    </div>
                </div>
                <nav className="dashboard-nav">
                    <NavLink to={home}>Overview</NavLink>
                    {user?.role === "buyer" && (
                        <>
                            <NavLink to="/products">Discover goods</NavLink>
                            <NavLink to="/cart">My bag</NavLink>
                            <NavLink to="/buyer#orders">My orders</NavLink>
                        </>
                    )}
                    {user?.role === "seller" && (
                        <>
                            <NavLink to="/my-products">My products</NavLink>
                            <a href="#orders">Orders</a>
                            <a href="#insights">Insights</a>
                        </>
                    )}
                    {user?.role === "admin" && (
                        <>
                            <NavLink to="/admin">Overview</NavLink>
                            <a href="#products">Products</a>
                            <a href="#orders">Orders</a>
                        </>
                    )}
                </nav>
                {user?.role === "buyer" && <Link className="sidebar-shop-link" to="/cart">Shopping bag <span>↗</span></Link>}
                <div className="dashboard-account">
                    <Link
                        className="dashboard-account-name"
                        to={home}
                        aria-label="Go to your dashboard"
                        title={user?.name || user?.emailID || user?.email || user?.role}
                    >
                        {user?.name || user?.shopName || user?.emailID || user?.email || user?.role}
                    </Link>
                    <button className="sidebar-logout" onClick={leave}>
                        Log out <span>↗</span>
                    </button>
                </div>
            </aside>
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <Link to="/" className="back-home">
                        ← Back to home
                    </Link>
                    <span className="dashboard-date">
                        A little space for good things{" "}
                        {user?.role === "buyer" && <Link to="/cart">Bag ↗</Link>}
                    </span>
                </header>
                <Outlet />
                <SiteFooter />
            </main>
        </div>
    );
}
