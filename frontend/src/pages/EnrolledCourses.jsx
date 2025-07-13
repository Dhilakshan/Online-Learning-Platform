import { useEffect, useState } from "react";
import api from "../common-function/axiosConfig";
import LoadingSpinner from "../components/LoadingSpinner";
import Login from "./login";

export default function EnrolledCourses({ setAuth }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEnrolled = async () => {
      setLoading(true);
      try {
        const res = await api.get("/courses/enrolled");
        setCourses(res.data);
      } catch {
        setError("Failed to load enrolled courses.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEnrolled();
    } else {
      setError("You are not logged in.");
      setLoading(false);
    }
  }, [token]);

  if (!token) {
    return <Login setAuth={setAuth} />;
  }

  if (loading)
    return <LoadingSpinner text="Loading your enrolled courses..." />;
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
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>
        My Enrolled Courses
      </h2>
      {courses.length === 0 ? (
        <div style={{ textAlign: "center" }}>
          You are not enrolled in any courses yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 28,
          }}
        >
          {courses.map((course) => (
            <div
              key={course._id}
              style={{
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 16px #e0eafc",
                padding: 28,
                display: "flex",
                flexDirection: "column",
                minHeight: 180,
                position: "relative",
                transition: "box-shadow 0.2s, transform 0.2s",
                border: "1.5px solid #e3e8ee",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 24px #b6d0f7";
                e.currentTarget.style.transform =
                  "translateY(-2px) scale(1.01)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 16px #e0eafc";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#2563eb",
                  marginBottom: 8,
                }}
              >
                {course.title}
              </div>
              <div style={{ color: "#444", marginBottom: 12, minHeight: 44 }}>
                {course.description}
              </div>
              <div style={{ color: "#888", fontSize: 15, marginTop: "auto" }}>
                Instructor:{" "}
                <span style={{ color: "#2563eb", fontWeight: 500 }}>
                  {course.instructor?.username || "Unknown"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
