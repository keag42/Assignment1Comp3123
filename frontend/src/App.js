import "./App.css";
import Navbar from "./Util/navbar.jsx";
import { useState } from "react";
import EmployeeView from "./Screens/employeeView";
import LoginView from "./Screens/login";
import EmployeeAdd from "./Screens/employeeAdd";
import EmployeeSearch from "./Screens/employeeSearch";
import EmployeeDetail from "./Screens/employeeDetail";
import { signupUser } from "./api/users";

function App() {
    const [error, setError] = useState("");
    const [message, setMessage] = useState({ text: "", color: "" });

    async function handleSignup(event) {
        event.preventDefault();
        setError("");
        setMessage({ text: "", color: "" });

        const formElement = event.currentTarget;
        const form = new FormData(formElement);

        try {
            await signupUser({
                username: form.get("username"),
                email: form.get("email"),
                password: form.get("password"),
            });

            formElement.reset();
            setMessage({ text: "Account created successfully.", color: "lightgreen" });
            setTimeout(() => {
                setMessage({ text: "", color: "" });
            }, 1000);
        } catch (requestError) {
            setError(requestError.response?.data?.error || "Could not connect to the server.");
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <Navbar />

                {window.location.pathname === "/contact" ? <EmployeeView /> : window.location.pathname === "/login" ? <LoginView /> : window.location.pathname === "/services" ? <EmployeeAdd /> : window.location.pathname === "/about" ? <EmployeeSearch /> : window.location.pathname === "/employee" ? <EmployeeDetail /> : <form onSubmit={handleSignup}>
                    <h2>Sign up</h2>

                    <label>
                        Username <input name="username" required />
                    </label>
                    <br />

                    <label>
                        Email <input type="email" name="email" required />
                    </label>
                    <br />

                    <label>
                        Password
                        <input
                            type="password"
                            name="password"
                            minLength={8}
                            pattern="(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+"
                            title="Use at least 8 letters and numbers, including at least one letter and one number."
                            required
                        />
                    </label>
                    <br />

                    {error && <p role="alert">{error}</p>}
                    {message.text && (
                        <p role="status" style={{ color: message.color }}>
                            {message.text}
                        </p>
                    )}

                    <button type="submit">Sign up</button>
                </form>}
            </header>
        </div>
    );
}

export default App;
