import { useEffect, useState } from "react";
import api from "../common-function/axiosConfig";
import { getUserRole } from "../common-function/token";
import LoadingSpinner from "../components/LoadingSpinner";
import Login from "./login";

export default function CourseList({ setAuth }) {
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [enrollStatus, setEnrollStatus] = useState({});
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const role = getUserRole();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/courses");
        setAllCourses(res.data);
        setCourses(res.data);
        // Only fetch enrolled courses for students
        if (role === "student") {
          const enrolledRes = await api.get("/courses/enrolled");
          setEnrolledIds(new Set(enrolledRes.data.map((c) => c._id)));
        }
      } catch {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
    // eslint-disable-next-line
  }, [role]);

  const enroll = async (id) => {
    setEnrollStatus((s) => ({ ...s, [id]: "loading" }));
    try {
      await api.post(`/courses/${id}/enroll`, {});
      setEnrollStatus((s) => ({ ...s, [id]: "success" }));
      setEnrolledIds((prev) => new Set(prev).add(id));
      setSuccessMessage("Enrollment successful!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setEnrollStatus((s) => ({
        ...s,
        [id]: error.response?.data?.error || "Enrollment failed",
      }));
    }
  };

  const handleSearch = async (searchValue) => {
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setCourses(allCourses);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await api.get(
        `/recommend/suggestions?keyword=${encodeURIComponent(
          searchValue.trim()
        )}`
      );

      // Map the suggestions back to full course objects
      const suggestedCourseIds = new Set(
        response.data.suggestions.map((s) => s.id)
      );
      const filteredCourses = allCourses.filter(
        (course) =>
          suggestedCourseIds.has(course._id) ||
          course.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          course.description.toLowerCase().includes(searchValue.toLowerCase())
      );

      setCourses(filteredCourses);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to client-side filtering
      const filteredCourses = allCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          course.instructor?.username
            ?.toLowerCase()
            .includes(searchValue.toLowerCase())
      );
      setCourses(filteredCourses);
    } finally {
      setSearchLoading(false);
    }
  };

  const token = localStorage.getItem("token");
  if (!token) {
    return <Login setAuth={setAuth} />;
  }

  if (loading) return <LoadingSpinner text="Loading courses..." />;
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
      {successMessage && (
        <div
          style={{
            background: "#22c55e",
            color: "#fff",
            padding: "12px 0",
            borderRadius: 8,
            textAlign: "center",
            marginBottom: 18,
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: 0.5,
          }}
        >
          {successMessage}
        </div>
      )}
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>
        Available Courses
      </h2>

      {/* Search Bar */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto 32px auto",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 16px #e0eafc",
            border: "1.5px solid #e3e8ee",
            overflow: "hidden",
          }}
        >
          <input
            type="text"
            placeholder="Search courses by title, description, or instructor..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "16px 20px",
              border: "none",
              outline: "none",
              fontSize: 16,
              background: "transparent",
            }}
          />
          {searchLoading && (
            <div
              style={{
                padding: "0 20px",
                color: "#2563eb",
                fontSize: 14,
              }}
            >
              Searching...
            </div>
          )}
          {searchTerm && (
            <button
              onClick={() => handleSearch("")}
              style={{
                padding: "16px 20px",
                background: "none",
                border: "none",
                color: "#888",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {courses.length === 0 ? (
        <div style={{ textAlign: "center" }}>
          {searchTerm ? (
            <div>
              <div style={{ fontSize: 18, color: "#666", marginBottom: 8 }}>
                No courses found for "{searchTerm}"
              </div>
              <button
                onClick={() => handleSearch("")}
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            "No courses available."
          )}
        </div>
      ) : (
        <>
          {searchTerm && (
            <div
              style={{
                textAlign: "center",
                marginBottom: 24,
                color: "#666",
                fontSize: 16,
              }}
            >
              Found {courses.length} course{courses.length !== 1 ? "s" : ""} for
              "{searchTerm}"
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 28,
            }}
          >
            {courses.map((course) => {
              const isEnrolled =
                enrolledIds.has(course._id) ||
                enrollStatus[course._id] === "success";
              return (
                <div
                  key={course._id}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 16px #e0eafc",
                    padding: 28,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 220,
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
                  <div
                    style={{ color: "#444", marginBottom: 12, minHeight: 44 }}
                  >
                    {course.description}
                  </div>
                  <div
                    style={{ color: "#888", fontSize: 15, marginBottom: 18 }}
                  >
                    Instructor:{" "}
                    <span style={{ color: "#2563eb", fontWeight: 500 }}>
                      {course.instructor?.username || "Unknown"}
                    </span>
                  </div>
                  {role === "student" && (
                    <div style={{ marginTop: "auto" }}>
                      <button
                        onClick={() => enroll(course._id)}
                        disabled={
                          isEnrolled || enrollStatus[course._id] === "loading"
                        }
                        style={{
                          background: isEnrolled
                            ? "#22c55e"
                            : "linear-gradient(90deg,#2563eb 60%,#61dafb 100%)",
                          color: "white",
                          padding: "10px 22px",
                          border: "none",
                          borderRadius: 6,
                          fontWeight: 600,
                          fontSize: 16,
                          cursor: isEnrolled ? "not-allowed" : "pointer",
                          boxShadow: "0 1px 6px #e0eafc",
                          transition: "background 0.2s, color 0.2s",
                        }}
                      >
                        {enrollStatus[course._id] === "loading"
                          ? "Enrolling..."
                          : isEnrolled
                          ? "Enrolled"
                          : "Enroll"}
                      </button>
                      {enrollStatus[course._id] &&
                        enrollStatus[course._id] !== "loading" &&
                        enrollStatus[course._id] !== "success" && (
                          <div
                            style={{ color: "red", marginTop: 8, fontSize: 14 }}
                          >
                            {enrollStatus[course._id]}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
