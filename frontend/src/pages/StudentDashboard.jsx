import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import Login from "./login";
import { getUserRole } from "../common-function/token";
import api from "../common-function/axiosConfig";

const StudentDashboard = ({ setAuth }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const role = getUserRole();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          "/courses/enrolled",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEnrolledCourses(res.data);
      } catch {
        setError("Failed to load enrolled courses.");
      } finally {
        setLoading(false);
      }
    };

    if (token && role == "student") {
      fetchEnrolledCourses();
    } else {
      setError("You are not logged in.");
      setLoading(false);
    }
  }, [token, role]);

  if (!token || role != "student") {
    return <Login setAuth={setAuth} />;
  }

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        {error}
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "2rem auto",
        fontFamily: "Segoe UI, sans-serif",
        padding: 12,
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 32 }}>
        Student Dashboard
      </h1>
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 16px #e0eafc",
          marginBottom: 24,
        }}
      >
        <h2 style={{ color: "#2563eb", marginBottom: 16 }}>Welcome!</h2>
        <p style={{ color: "#444", lineHeight: 1.6 }}>
          Welcome to your dashboard! Here you can view your enrolled courses,
          track your progress, and access learning resources.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 16px #e0eafc",
        }}
      >
        <h2 style={{ color: "#2563eb", marginBottom: 16 }}>
          Your Enrolled Courses ({enrolledCourses.length})
        </h2>
        {enrolledCourses.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: 20 }}>
            You haven't enrolled in any courses yet.
            <br />
            <a
              href="/courses"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Browse available courses →
            </a>
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {enrolledCourses.map((course) => (
              <div
                key={course._id}
                style={{
                  background: "#f8fafc",
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ color: "#1e293b", marginBottom: 8, fontSize: 18 }}>
                  {course.title}
                </h3>
                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>
                  {course.description}
                </p>
                <p style={{ color: "#2563eb", fontSize: 12, fontWeight: 500 }}>
                  Instructor: {course.instructor?.username || "Unknown"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
