import { useState } from "react";
import axios from "axios";

export default function Signup() {
    const [emailID, setEmailID] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("buyer");

    const handleSubmit = async (e) => {
        console.log('submit clicked')
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:5000/user/signup",
                {
                    name,
                    emailID,
                    password,
                    role,
                },
            );
            console.log(response.data);
        } catch (error) {
            console.error("Error occurred while signing up:", error);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <br />
                <br />
                <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={role === "buyer"}
                    onChange={(e) => setRole(e.target.value)}
                />
                Buyer
                <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={role === "seller"}
                    onChange={(e) => setRole(e.target.value)}
                />
                Seller
                <br />
                <br />
                <input
                    type="text"
                    name="emailID"
                    placeholder="Enter emailID"
                    value={emailID}
                    onChange={(e) => setEmailID(e.target.value)}
                />
                <br />
                <br />
                <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />
                <br />
                <button type="submit">
                    Sign Up
                </button>
            </form>
        </>
    );
}
