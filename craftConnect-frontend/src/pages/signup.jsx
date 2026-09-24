import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import api, { getApiError } from "../services/api.js";
import "./Auth.css";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("buyer");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/user/Signup", {
                name,
                email,
                password,
                role,
                ...(role === "seller" ? { shopName: name } : {}),
            });
            login(data);
            navigate(data.user.role === "seller" ? "/seller" : "/buyer");
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
                <span>SMALL FINDS</span>
                <strong>
                    big
                    <br />
                    meaning.
                </strong>
                <i>02 — Made by hand. Found by heart.</i>
            </div>
            <form className="auth-card" onSubmit={submit}>
                <p className="auth-kicker">Good things start here</p>
                <h1>
                    Make room
                    <br />
                    <em>for lovely.</em>
                </h1>
                <p className="auth-subtitle">
                    A thoughtful little community for makers and people who love
                    what they make.
                </p>
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
                <div className="auth-role-label">I’M HERE TO…</div>
                <div className="role-picker">
                    <label className={role === "buyer" ? "selected" : ""}>
                        <input
                            type="radio"
                            name="role"
                            value="buyer"
                            checked={role === "buyer"}
                            onChange={() => setRole("buyer")}
                        />
                        <span className="role-icon">⌕</span>
                        <strong>Shopper</strong>
                        <strong>Find good things</strong>
                        <span>Shop thoughtful finds</span>
                    </label>
                    <label className={role === "seller" ? "selected" : ""}>
                        <input
                            type="radio"
                            name="role"
                            value="seller"
                            checked={role === "seller"}
                            onChange={() => setRole("seller")}
                        />
                        <span className="role-icon">✳</span>
                        <strong>Seller</strong>
                        <strong>Share my craft</strong>
                        <span>Set up a maker space</span>
                    </label>
                </div>
                {error && <p className="auth-error" role="alert">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Creating account…" : "Sign up"} <span>↗</span>
                </button>
                <p className="auth-switch">
                    Already one of us? <Link to="/signin">Login →</Link>
                </p>             
            </form>
            <SiteFooter dark />
        </div>
    );
}
