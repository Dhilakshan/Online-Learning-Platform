import React, { useState, useEffect } from "react";
import api from "../common-function/axiosConfig";
import LoadingSpinner from "./LoadingSpinner";
import { getUserRole } from "../common-function/token";

const CourseRecommendations = () => {
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);

  const userRole = getUserRole();

  // Fetch enrolled courses for students
  useEffect(() => {
    if (userRole === "student") {
      fetchEnrolledCourses();
    }
  }, [userRole]);

  const fetchEnrolledCourses = async () => {
    try {
      setEnrolledLoading(true);
      const response = await api.get("/courses/enrolled");
      setEnrolledCourses(response.data.map((course) => course._id));
    } catch (error) {
      console.error("Failed to fetch enrolled courses:", error);
    } finally {
      setEnrolledLoading(false);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.includes(courseId);
  };

  const examplePrompts = [
    "I want to be a software engineer, what courses should I follow?",
    "I'm interested in web development, recommend some courses",
    "I want to learn data science and machine learning",
    "I'm a beginner in programming, where should I start?",
    "I want to become a full-stack developer",
    "I'm interested in mobile app development",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setRecommendations(null);

    try {
      const response = await api.post("/recommend/courses", {
        prompt: prompt.trim(),
      });

      console.log("response: ", response.data);

      setRecommendations(response.data);
    } catch (err) {
      console.log("err: ", err);
      setError(err.response?.data?.error || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (quickPrompt) => {
    setPrompt(quickPrompt);
    setShowSuggestions(false);
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`, {});
      alert("Successfully enrolled in the course!");
      // Refresh enrolled courses list
      if (userRole === "student") {
        await fetchEnrolledCourses();
      }
    } catch (error) {
      alert(
        "Failed to enroll: " + (error.response?.data?.error || "Unknown error")
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "2rem auto",
        fontFamily: "Segoe UI, sans-serif",
        padding: 12,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: 24,
        }}
      >
        <h1 style={{ textAlign: "center", color: "#2563eb", marginBottom: 16 }}>
          AI Course Recommendations
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: 32,
            fontSize: 16,
          }}
        >
          Tell us about your learning goals and get personalized course
          recommendations powered by AI
        </p>

        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your learning goals... (e.g., 'I want to be a software engineer, what courses should I follow?')"
              required
              disabled={loading}
              rows={4}
              style={{
                width: "100%",
                padding: "16px",
                border: "2px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 16,
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: "14px 28px",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading || !prompt.trim() ? 0.6 : 1,
              }}
            >
              {loading ? "Analyzing..." : "Get Recommendations"}
            </button>

            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              style={{
                background: "#f8fafc",
                color: "#374151",
                border: "2px solid #e2e8f0",
                padding: "14px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {showSuggestions ? "Hide Examples" : "Show Examples"}
            </button>
          </div>
        </form>

        {showSuggestions && (
          <div
            style={{
              background: "#f8fafc",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ color: "#374151", marginBottom: 16 }}>
              Quick Examples:
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 12,
              }}
            >
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(example)}
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    padding: "12px 16px",
                    borderRadius: 8,
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#374151",
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <LoadingSpinner text="Analyzing your request and finding the best courses..." />
        </div>
      )}

      {recommendations && (
        <div
          style={{
            background: "#fff",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ color: "#2563eb", marginBottom: 12 }}>
              Your Request:
            </h2>
            <p style={{ color: "#666", fontStyle: "italic" }}>
              "{recommendations.userPrompt}"
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ color: "#2563eb", marginBottom: 12 }}>Analysis:</h2>
            <p style={{ color: "#374151", lineHeight: 1.6 }}>
              {recommendations.analysis}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ color: "#2563eb", marginBottom: 16 }}>
              Recommended Courses:
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: 20,
              }}
            >
              {recommendations.recommendations.map((rec, index) => (
                <div
                  key={index}
                  style={{
                    background: "#f8fafc",
                    padding: 20,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <h3
                      style={{
                        color: "#1e293b",
                        fontSize: 18,
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {rec.course?.title || rec.title}
                    </h3>
                    <span
                      style={{
                        background:
                          rec.relevance === "High"
                            ? "#dcfce7"
                            : rec.relevance === "Medium"
                            ? "#fef3c7"
                            : "#fee2e2",
                        color:
                          rec.relevance === "High"
                            ? "#166534"
                            : rec.relevance === "Medium"
                            ? "#92400e"
                            : "#dc2626",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {rec.relevance} Relevance
                    </span>
                  </div>

                  {rec.course?.description && (
                    <p
                      style={{
                        color: "#64748b",
                        marginBottom: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {rec.course.description}
                    </p>
                  )}

                  <p
                    style={{
                      color: "#374151",
                      marginBottom: 16,
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    <strong>Why recommended:</strong> {rec.reason}
                  </p>

                  {rec.course && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#6b7280", fontSize: 14 }}>
                        Instructor:{" "}
                        {rec.course.instructor?.username || "Unknown"}
                      </span>
                      {userRole === "student" ? (
                        enrolledLoading ? (
                          <span style={{ color: "#6b7280", fontSize: 14 }}>
                            Loading...
                          </span>
                        ) : isEnrolled(rec.course._id) ? (
                          <button
                            disabled
                            style={{
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: 6,
                              fontSize: 14,
                              fontWeight: 500,
                              cursor: "not-allowed",
                              opacity: 0.8,
                            }}
                          >
                            ✓ Enrolled
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(rec.course._id)}
                            style={{
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: 6,
                              fontSize: 14,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Enroll Now
                          </button>
                        )
                      ) : (
                        <span style={{ color: "#6b7280", fontSize: 14 }}>
                          Login as student to enroll
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ color: "#2563eb", marginBottom: 12 }}>
              Learning Path:
            </h2>
            <p style={{ color: "#374151", lineHeight: 1.6 }}>
              {recommendations.learningPath}
            </p>
          </div>

          {recommendations.additionalAdvice && (
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                padding: 20,
                borderRadius: 12,
              }}
            >
              <h3 style={{ color: "#0369a1", marginBottom: 8 }}>
                Additional Advice:
              </h3>
              <p style={{ color: "#0c4a6e", lineHeight: 1.6 }}>
                {recommendations.additionalAdvice}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseRecommendations;
