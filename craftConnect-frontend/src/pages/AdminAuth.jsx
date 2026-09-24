import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import api, { getApiError } from "../services/api.js";
import "./Auth.css";

// Shared page frame, same layout as the regular sign-in page.
function AdminAuthPage({ kicker, title, emphasis, subtitle, onSubmit, children }) {
    return (
        <div className="auth-page">
            <Link className="auth-brand" to="/">
                cc <span>craftconnect</span>
            </Link>
            <div className="auth-aside">
                <span>CONTROL ROOM</span>
                <strong>
                    keep good
                    <br />
                    things moving.
                </strong>
                <i>Admin access</i>
            </div>
            <form className="auth-card" onSubmit={onSubmit}>
                <p className="auth-kicker">{kicker}</p>
                <h1>
                    {title}
                    <br />
                    <em>{emphasis}</em>
                </h1>
                <p className="auth-subtitle">{subtitle}</p>
                {children}
            </form>
            <SiteFooter dark />
        </div>
    );
}

function useAdminSubmit(endpoint, body) {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post(endpoint, body);
            login(data);
            navigate("/admin");
        } catch (requestError) {
            setError(getApiError(requestError));
        } finally {
            setLoading(false);
        }
    };
    return { error, loading, submit };
}

export function AdminSignin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { error, loading, submit } = useAdminSubmit("/admin/signin", { email, password });
    return (
        <AdminAuthPage
            kicker="Admin sign in"
            title="Welcome"
            emphasis="back."
            subtitle="Sign in with your admin account to manage members, listings, and orders."
            onSubmit={submit}
        >
            <label className="auth-label">
                Email address
                <input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </label>
            <label className="auth-label">
                Password
                <input
                    required
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Login"} <span>↗</span>
            </button>
            <p className="auth-switch">
                Need an admin account? <Link to="/admin/signup">Create one →</Link>
            </p>
        </AdminAuthPage>
    );
}

export function AdminSignup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [setupKey, setSetupKey] = useState("");
    const { error, loading, submit } = useAdminSubmit("/admin/signup", { name, email, password, setupKey });
    return (
        <AdminAuthPage
            kicker="New admin"
            title="Create an"
            emphasis="admin account."
            subtitle="You’ll need the admin setup key configured on the server."
            onSubmit={submit}
        >
            <label className="auth-label">
                Your name
                <input
                    required
                    autoComplete="name"
                    placeholder="What should we call you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>
            <label className="auth-label">
                Email address
                <input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </label>
            <label className="auth-label">
                Password
                <input
                    required
                    type="password"
                    autoComplete="new-password"
                    minLength="8"
                    maxLength="72"
                    pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
                    title="At least 8 characters, with a letter and a number"
                    placeholder="8+ characters, a letter and a number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>
            <label className="auth-label">
                Admin setup key
                <input
                    required
                    type="password"
                    autoComplete="off"
                    placeholder="From the server’s ADMIN_SIGNUP_KEY"
                    value={setupKey}
                    onChange={(e) => setSetupKey(e.target.value)}
                />
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? "Creating account…" : "Create admin account"} <span>↗</span>
            </button>
            <p className="auth-switch">
                Already an admin? <Link to="/admin/signin">Login →</Link>
            </p>
        </AdminAuthPage>
    );
}
