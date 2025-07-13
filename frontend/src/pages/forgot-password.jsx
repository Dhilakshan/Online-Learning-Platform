import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await axios.post(
        "https://online-learning-platform-be.onrender.com/api/auth/forgot-password",
        { email }
      );
      setSuccess(data.message || "Password reset email sent successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p style={{ color: "#666", textAlign: "center", marginBottom: 24 }}>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
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
              Sending...
            </div>
          ) : (
            "Send Reset Link"
          )}
        </button>

        <p className="signup-link">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
