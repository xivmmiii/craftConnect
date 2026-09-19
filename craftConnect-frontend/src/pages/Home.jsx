import { useAuth } from "../context/AuthContext";
import {Link} from 'react-router-dom'

export default function Home() {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Welcome to CraftConnect</h1>
            {user ? (
                <div>
                    <p>Logged in as: {user.role}</p>
                    {user.role === "buyer" && (
                        <Link to="/products">Browse Products</Link>
                    )}
                    {user.role === "seller" && (
                        <Link to="/my-products">My Products</Link>
                    )}
                    {user.role === "admin" && (
                        <Link to="/admin">Admin Panel</Link>
                    )}
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <p>Please log in or sign up.</p>
            )}
        </div>
    );
}
