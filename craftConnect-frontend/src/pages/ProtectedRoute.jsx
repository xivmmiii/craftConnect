import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ roles }) {
    const { user, authChecked } = useAuth();
    if (!user && !authChecked) return null; // wait for the session cookie check
    if (!user) return <Navigate to="/signin" replace />;
    if (roles && !roles.includes(user.role)) {
        const home = user.role === "seller" ? "/seller" : user.role === "admin" ? "/admin" : "/buyer";
        return <Navigate to={home} replace />;
    }
    return <Outlet />;
}
