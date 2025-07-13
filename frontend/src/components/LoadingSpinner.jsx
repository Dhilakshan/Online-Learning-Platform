import React from "react";

const LoadingSpinner = ({
  text = "Loading...",
  size = 48,
  color = "#2563eb",
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
        gap: 16,
      }}
    >
      <div
        className="spinner"
        style={{
          width: size,
          height: size,
          border: `5px solid #e0eafc`,
          borderTop: `5px solid ${color}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      {text && (
        <p
          style={{
            color: "#666",
            fontSize: 16,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {text}
        </p>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingSpinner;
