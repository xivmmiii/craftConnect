import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signin() {
    const [emailID, setEmailID] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const response = await axios.post(
                "http://localhost:5000/user/Signin",
                {
                    emailID,
                    password,
                },
            );
            login(response.data.token);
            navigate("/");
        } catch (error) {
            console.error("Error occurred while Signing in:", error);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    name="emailID"
                    placeholder="Email ID"
                    value={emailID}
                    onChange={(e) => setEmailID(e.target.value)}
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Signin</button>
            </form>
        </>
    );
}
