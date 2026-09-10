import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signin() {
    const [emailID, setEmailID] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const response = await axios.post(
                "http://localhost:5000/user/signin",
                {
                    emailID,
                    password,
                },
            );
            localStorage.setItem("token", response.data.token);
            navigate("/");
        } catch (error) {
            console.error("Error occurred while signing in:", error);
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
