import { useState } from "react";
import { loginUser } from "../api/users";

export default function LoginView() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const identifier = form.get("identifier").trim();
    const credentials = {
      password: form.get("password"),
      ...(identifier.includes("@") ? { email: identifier } : { username: identifier }),
    };

    try {
      const response = await loginUser(credentials);

      localStorage.setItem("token", response.data.token);
      window.dispatchEvent(new Event("auth-changed"));
      setMessage("Login successful. Your token is saved for the employee viewer.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not connect to the server.");
    }
  }

  return (
    <section>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <label>
          Email or username <input name="identifier" required />
        </label>
        <br />
        <label>
          Password <input type="password" name="password" required />
        </label>
        <br />
        {error && <p role="alert" style={{ color: "salmon" }}>{error}</p>}
        {message && <p role="status" style={{ color: "lightgreen" }}>{message}</p>}
        <button type="submit">Log in</button>
      </form>
      <p>
        Don&apos;t have an account? <a href="/">Sign up</a>
      </p>
    </section>
  );
}
