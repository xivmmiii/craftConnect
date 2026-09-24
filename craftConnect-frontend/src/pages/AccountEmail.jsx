import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter.jsx";
import api, { getApiError } from "../services/api.js";
import "./Auth.css";

// Emailed reset links carry the token in the URL fragment, which is never sent to servers
// or leaked through the Referer header.
const readTokenFromHash = () => new URLSearchParams(window.location.hash.slice(1)).get("token") || "";

function AuthShell({ kicker, title, emphasis, children }) {
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
                <i>A marketplace with a human touch</i>
            </div>
            <div className="auth-card">
                <p className="auth-kicker">{kicker}</p>
                <h1>
                    {title}
                    <br />
                    <em>{emphasis}</em>
                </h1>
                {children}
            </div>
            <SiteFooter dark />
        </div>
    );
}

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/user/forgot-password", { email });
            setNotice(data.message);
        } catch (requestError) {
            setError(getApiError(requestError));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell kicker="It happens to everyone" title="Forgot your" emphasis="password?">
            {notice ? (
                <p className="auth-subtitle" role="status">{notice}</p>
            ) : (
                <form onSubmit={submit}>
                    <p className="auth-subtitle">
                        Enter your email and we’ll send you a link to choose a new one.
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
                    {error && <p className="auth-error" role="alert">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? "Sending…" : "Send reset link"} <span>↗</span>
                    </button>
                </form>
            )}
            <p className="auth-switch">
                Remembered it? <Link to="/signin">Login →</Link>
            </p>
        </AuthShell>
    );
}

export function ResetPassword() {
    const [token] = useState(readTokenFromHash);
    const [password, setPassword] = useState("");
    const [notice, setNotice] = useState("");
    const [error, setError] = useState(token ? "" : "This reset link is incomplete.");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.history.replaceState(null, "", window.location.pathname);
    }, []);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/user/reset-password", { token, password });
            setNotice(data.message);
        } catch (requestError) {
            setError(getApiError(requestError));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell kicker="A fresh start" title="Choose a new" emphasis="password.">
            {notice ? (
                <>
                    <p className="auth-subtitle" role="status">{notice}</p>
                    <p className="auth-switch">
                        <Link to="/signin">Login →</Link>
                    </p>
                </>
            ) : (
                <form onSubmit={submit}>
                    <label className="auth-label">
                        New password
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
                    {error && <p className="auth-error" role="alert">{error}</p>}
                    <button type="submit" disabled={loading || !token}>
                        {loading ? "Saving…" : "Update password"} <span>↗</span>
                    </button>
                    <p className="auth-switch">
                        Link expired? <Link to="/forgot-password">Request a new one →</Link>
                    </p>
                </form>
            )}
        </AuthShell>
    );
}
