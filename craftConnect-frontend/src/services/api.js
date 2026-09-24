import axios from "axios";
import { API_URL } from "../config.js";

// The session is an httpOnly cookie set by the API, so JavaScript never sees the token.
const api = axios.create({
    baseURL: API_URL.replace(/\/+$/, ""),
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Sign-in failures and the startup session check are handled where they're made.
        const url = error.config?.url || "";
        if (error.response?.status === 401 && !url.startsWith("/user/Signin") && url !== "/user/me") {
            window.dispatchEvent(new Event("cc:auth-expired"));
        }
        return Promise.reject(error);
    },
);

export const getApiError = (error) =>
    error.response?.data?.message || error.message || "Something went wrong. Please try again.";

export default api;
