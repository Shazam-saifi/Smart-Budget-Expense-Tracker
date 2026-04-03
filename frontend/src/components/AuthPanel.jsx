import { useState } from "react";

import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialLogin = { email: "", password: "" };
const initialRegister = { full_name: "", email: "", password: "" };

export default function AuthPanel() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = mode === "login" ? loginForm : registerForm;
      const response = mode === "login" ? await api.login(payload) : await api.register(payload);
      login(response);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="hero-copy">
        <span className="eyebrow">Personal Finance Intelligence</span>
        <h1>Smart Budget & Expense Tracker</h1>
        <p>
          Track income, control spending, set category budgets, and turn monthly data into
          practical financial decisions.
        </p>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="tab-row">
          <button type="button" className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")}>
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "register" && (
          <label>
            Full name
            <input
              value={registerForm.full_name}
              onChange={(event) => setRegisterForm({ ...registerForm, full_name: event.target.value })}
              placeholder="Shazam Saifi"
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={mode === "login" ? loginForm.email : registerForm.email}
            onChange={(event) =>
              mode === "login"
                ? setLoginForm({ ...loginForm, email: event.target.value })
                : setRegisterForm({ ...registerForm, email: event.target.value })
            }
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={mode === "login" ? loginForm.password : registerForm.password}
            onChange={(event) =>
              mode === "login"
                ? setLoginForm({ ...loginForm, password: event.target.value })
                : setRegisterForm({ ...registerForm, password: event.target.value })
            }
            placeholder="Minimum 6 characters"
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login to dashboard" : "Create account"}
        </button>
      </form>
    </div>
  );
}
