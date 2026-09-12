import { useAuth } from "../context/AuthContext";

export default function Home() {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Welcome to CraftConnect</h1>
            {user ? (
                <div>
                    <p>Logged in as: {user.role}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <p>Please log in or sign up.</p>
            )}
        </div>
    );
}
