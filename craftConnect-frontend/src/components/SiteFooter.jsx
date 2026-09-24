import { Link } from "react-router-dom";
import "./SiteFooter.css";

export default function SiteFooter({ dark = false }) {
    return (
        <footer className={`app-footer${dark ? " app-footer-dark" : ""}`}>
            <Link className="footer-brand" to="/" aria-label="CraftConnect home">
                <span>cc</span>
                <strong>craftconnect</strong>
            </Link>
            <p>Made by hand. Found by heart.</p>
            <nav aria-label="Footer navigation">
                <Link to="/products">Discover</Link>
                <Link to="/signup">Join us</Link>
                <Link to="/cart">Your bag</Link>
            </nav>
            <small>© {new Date().getFullYear()} CraftConnect · A little space for good things.</small>
        </footer>
    );
}
