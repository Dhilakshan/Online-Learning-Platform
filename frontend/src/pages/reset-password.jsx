import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { token, password }
      );
      setSuccess(data.message || "Password reset successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Invalid Reset Link</h2>
          <p className="error">{error}</p>
          <a
            href="/forgot-password"
            style={{ color: "#2563eb", textDecoration: "none" }}
          >
            Request new reset link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p style={{ color: "#666", textAlign: "center", marginBottom: 24 }}>
          Enter your new password below.
        </p>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="row" style={{ position: "relative" }}>
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <div className="row" style={{ position: "relative" }}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ paddingRight: 36 }}
            disabled={loading}
          />
          <span
            onClick={() => setShowConfirmPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 10,
              top: 38,
              cursor: "pointer",
              fontSize: "1.2rem",
              userSelect: "none",
            }}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
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
              Resetting...
            </div>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
