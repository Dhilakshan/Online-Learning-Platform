import React, { useState, useEffect } from "react";
import api from "../common-function/axiosConfig";
import { getUserRole } from "../common-function/token";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminDashboard = () => {
  const [usageData, setUsageData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    maxRequests: 250,
    isActive: true,
    adminNotes: "",
  });
  const [updating, setUpdating] = useState(false);

  const role = getUserRole();

  useEffect(() => {
    if (role !== "admin") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    fetchData();
  }, [role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usageResponse, summaryResponse] = await Promise.all([
        api.get("/admin/api-usage"),
        api.get("/admin/api-usage/summary"),
      ]);

      setUsageData(usageResponse.data);
      setSummaryData(summaryResponse.data);

      // Set current settings
      setSettings({
        maxRequests: usageResponse.data.currentUsage.maxRequests,
        isActive: usageResponse.data.currentUsage.isActive,
        adminNotes: usageResponse.data.currentUsage.adminNotes || "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    try {
      setUpdating(true);
      await api.put("/admin/api-usage/settings", settings);
      await fetchData(); // Refresh data
      alert("Settings updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update settings");
    } finally {
      setUpdating(false);
    }
  };

  const resetDailyCount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset the daily API usage count?"
      )
    ) {
      return;
    }

    try {
      await api.post("/admin/api-usage/reset");
      await fetchData(); // Refresh data
      alert("Daily count reset successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reset daily count");
    }
  };

  if (role !== "admin") {
    return (
      <div style={{ textAlign: "center", marginTop: 40, color: "red" }}>
        {error || "Access denied. Admin privileges required."}
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 40, color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "2rem auto",
        fontFamily: "Segoe UI, sans-serif",
        padding: 12,
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 32, color: "#2563eb" }}>
        Admin Dashboard - AI API Management
      </h1>

      {/* Current Usage Overview */}
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 16px #e0eafc",
          marginBottom: 24,
        }}
      >
        <h2 style={{ color: "#2563eb", marginBottom: 20 }}>Current Usage</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: 20,
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#2563eb" }}>
              {usageData?.currentUsage.requestsToday || 0}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>Requests Today</div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: 20,
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#22c55e" }}>
              {usageData?.currentUsage.remainingRequests || 0}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>Remaining</div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: 20,
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#f59e0b" }}>
              {usageData?.currentUsage.maxRequests || 250}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>Daily Limit</div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: 20,
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: usageData?.currentUsage.isActive ? "#22c55e" : "#ef4444",
              }}
            >
              {usageData?.currentUsage.isActive ? "Active" : "Inactive"}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>API Status</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 14, color: "#666" }}>Usage Progress</span>
            <span style={{ fontSize: 14, color: "#666" }}>
              {Math.round(
                ((usageData?.currentUsage.requestsToday || 0) /
                  (usageData?.currentUsage.maxRequests || 250)) *
                  100
              )}
              %
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 8,
              background: "#e2e8f0",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(
                  ((usageData?.currentUsage.requestsToday || 0) /
                    (usageData?.currentUsage.maxRequests || 250)) *
                    100,
                  100
                )}%`,
                height: "100%",
                background: usageData?.currentUsage.isLimitReached
                  ? "#ef4444"
                  : "#2563eb",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 16px #e0eafc",
          marginBottom: 24,
        }}
      >
        <h2 style={{ color: "#2563eb", marginBottom: 20 }}>API Settings</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Daily Request Limit
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={settings.maxRequests}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxRequests: parseInt(e.target.value) || 250,
                })
              }
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 16,
              }}
            />
          </div>

          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              API Status
            </label>
            <select
              value={settings.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  isActive: e.target.value === "active",
                })
              }
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 16,
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            Admin Notes
          </label>
          <textarea
            value={settings.adminNotes}
            onChange={(e) =>
              setSettings({ ...settings, adminNotes: e.target.value })
            }
            placeholder="Add notes about API usage or maintenance..."
            rows={3}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              fontSize: 16,
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <button
            onClick={updateSettings}
            disabled={updating}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 500,
              cursor: updating ? "not-allowed" : "pointer",
              opacity: updating ? 0.6 : 1,
            }}
          >
            {updating ? "Updating..." : "Update Settings"}
          </button>

          <button
            onClick={resetDailyCount}
            style={{
              background: "#f59e0b",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reset Daily Count
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 16px #e0eafc",
          marginBottom: 24,
        }}
      >
        <h2 style={{ color: "#2563eb", marginBottom: 20 }}>Statistics</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: 16,
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#2563eb" }}>
              {usageData?.statistics.totalRequests || 0}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>
              Total Requests (7 days)
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: 16,
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#22c55e" }}>
              {usageData?.statistics.averageRequestsPerDay || 0}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>Avg. Requests/Day</div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: 16,
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#f59e0b" }}>
              {summaryData?.summary.thisMonth.totalRequests || 0}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>This Month</div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: 16,
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#8b5cf6" }}>
              {summaryData?.summary.thisMonth.averageDailyRequests || 0}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>Monthly Average</div>
          </div>
        </div>
      </div>

      {/* Historical Data */}
      {usageData?.historicalData && usageData.historicalData.length > 0 && (
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 2px 16px #e0eafc",
          }}
        >
          <h2 style={{ color: "#2563eb", marginBottom: 20 }}>
            Recent History (7 Days)
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Requests
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Limit
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Usage %
                  </th>
                </tr>
              </thead>
              <tbody>
                {usageData.historicalData.map((day, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px" }}>
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {day.requestsToday}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {day.maxRequests}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {Math.round((day.requestsToday / day.maxRequests) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
