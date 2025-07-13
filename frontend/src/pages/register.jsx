import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import { getUserRole } from "../common-function/token";

export default function Register({ setAuth }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );
      if (data) {
        setSuccess("Registration successful! Redirecting to Dashboard...");
        console.log(data);

        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data));

          if (getUserRole() === "instructor") {
            navigate("/instructor");
            setAuth(true);
          } else if (getUserRole() === "student") {
            navigate("/student");
            setAuth(true);
          } else {
            setError("Invalid role. Please try again.");
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2 className="title">Sign Up</h2>
        <p className="subtitle">Create a new account to get started</p>

        <div className="row">
          <label>Full Name</label>
          <input
            name="username"
            placeholder="Enter your full name"
            value={form.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="row">
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="row" style={{ position: "relative" }}>
          <label>Password</label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ paddingRight: 36 }}
            disabled={loading}
          />
          <span
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 10,
              top: 38,
              cursor: "pointer",
              fontSize: "1.2rem",
              userSelect: "none",
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                setShowPassword((v) => !v);
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <div className="row">
          <label>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid #fff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              Creating Account...
            </div>
          ) : (
            "Sign Up"
          )}
        </button>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <p className="login-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </form>
    </div>
  );
}
