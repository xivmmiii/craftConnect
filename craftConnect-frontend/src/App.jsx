import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardLayout from "./pages/DashboardLayout";
import ProtectedRoute from "./pages/ProtectedRoute";
import { ForgotPassword, ResetPassword } from "./pages/AccountEmail.jsx";
import { AdminSignin, AdminSignup } from "./pages/AdminAuth.jsx";
import {
    CartPage,
    CheckoutPage,
    ConfirmationPage,
    ShopPage,
} from "./pages/Marketplace.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/admin/signin" element={<AdminSignin />} />
                <Route path="/admin/signup" element={<AdminSignup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ShopPage />} />
                <Route element={<ProtectedRoute roles={["buyer"]} />}>
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation" element={<ConfirmationPage />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route element={<ProtectedRoute roles={["buyer"]} />}>
                            <Route path="/buyer" element={<BuyerDashboard />} />
                        </Route>
                        <Route element={<ProtectedRoute roles={["seller"]} />}>
                            <Route path="/seller" element={<SellerDashboard />} />
                            <Route path="/my-products" element={<SellerDashboard />} />
                        </Route>
                        <Route element={<ProtectedRoute roles={["admin"]} />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
