import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import api, { getApiError } from "../services/api.js";
import "./Auth.css";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/user/Signin", { email, password });
            login(data);
            const role = data.user?.role;
            navigate(role === "seller" ? "/seller" : role === "admin" ? "/admin" : "/buyer");
        } catch (requestError) {
            setError(getApiError(requestError));
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth-page">
            <Link className="auth-brand" to="/">
                cc <span>craftconnect</span>
            </Link>
            <div className="auth-aside">
                <span>GOOD THINGS</span>
                <strong>
                    find their
                    <br />
                    people.
                </strong>
                <i>01 — A marketplace with a human touch</i>
            </div>
            <form className="auth-card" onSubmit={submit}>
                <p className="auth-kicker">Your corner of the marketplace</p>
                <h1>
                    Welcome
                    <br />
                    <em>back.</em>
                </h1>
                <p className="auth-subtitle">
                    Sign in, settle in, and pick up where the good stuff left
                    off.
                </p>
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
                <p className="auth-switch">
                    <Link to="/forgot-password">Forgot password?</Link>
                </p>
                {error && <p className="auth-error" role="alert">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Signing in…" : "Login"} <span>↗</span>
                </button>
                <p className="auth-switch">
                    New around here?{" "}
                    <Link to="/signup">Create Account →</Link>
                </p>            
            </form>
            <SiteFooter dark />
        </div>
    );
}
