import React from "react";
import LoadingSpinner from "../components/LoadingSpinner";

const LoadingPage = ({
  title = "Loading Application",
  subtitle = "Please wait while we prepare everything for you...",
  showLogo = true,
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {showLogo && (
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2563eb 40%, #61dafb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            color: "#fff",
            marginBottom: 32,
            boxShadow: "0 4px 20px rgba(37, 99, 235, 0.3)",
          }}
        >
          📚
        </div>
      )}

      <h1
        style={{
          color: "#1e293b",
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          color: "#64748b",
          fontSize: "1.1rem",
          textAlign: "center",
          marginBottom: 40,
          maxWidth: 400,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>

      <LoadingSpinner text="" size={56} color="#2563eb" />

      <div
        style={{
          marginTop: 40,
          display: "flex",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#2563eb",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#2563eb",
            animation: "pulse 1.5s ease-in-out infinite 0.2s",
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#2563eb",
            animation: "pulse 1.5s ease-in-out infinite 0.4s",
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;
