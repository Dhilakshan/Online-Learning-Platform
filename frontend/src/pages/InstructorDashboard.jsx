import { useState, useEffect } from "react";
import api from "../common-function/axiosConfig";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUserRole } from "../common-function/token";
import Login from "./login";

const InstructorDashboard = ({ setAuth }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const role = getUserRole();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/courses/instructor");
        setCourses(res.data);
      } catch {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    if (role === "instructor") {
      fetchCourses();
    } else {
      setError("You are not authorized to access this page.");
      setLoading(false);
    }
  }, [role]);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { data } = await api.post("/courses", formData);
      setCourses([...courses, data]);
      setShowAddForm(false);
      setFormData({ title: "", description: "", content: "" });
    } catch (error) {
      alert(
        "Failed to create course: " +
          (error.response?.data?.error || "Unknown error")
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { data } = await api.put(
        `/courses/${selectedCourse._id}`,
        formData
      );
      setCourses(
        courses.map((course) =>
          course._id === selectedCourse._id ? data : course
        )
      );
      setShowEditModal(false);
      setSelectedCourse(null);
      setFormData({ title: "", description: "", content: "" });
    } catch (error) {
      alert(
        "Failed to update course: " +
          (error.response?.data?.error || "Unknown error")
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading((prev) => ({ ...prev, [selectedCourse._id]: true }));
    try {
      await api.delete(`/courses/${selectedCourse._id}`);
      setCourses(courses.filter((course) => course._id !== selectedCourse._id));
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (error) {
      alert(
        "Failed to delete course: " +
          (error.response?.data?.error || "Unknown error")
      );
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [selectedCourse._id]: false }));
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      content: course.content || "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const openStudentsModal = async (course) => {
    setSelectedCourse(course);
    setShowStudentsModal(true);
    setStudentsLoading(true);

    try {
      const response = await api.get(`/courses/${course._id}/students`);
      setCourseStudents(response.data);
    } catch (error) {
      alert(
        "Failed to load students: " +
          (error.response?.data?.error || "Unknown error")
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  const token = localStorage.getItem("token");
  if (!token || role != "instructor") {
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
        Instructor Dashboard
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
          Welcome to your instructor dashboard! Here you can manage your
          courses, view student enrollments, and create new learning content.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 16px #e0eafc",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ color: "#2563eb", margin: 0 }}>
            My Courses ({courses.length})
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: "linear-gradient(90deg,#2563eb 60%,#61dafb 100%)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            + Add New Course
          </button>
        </div>

        {courses.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: 20 }}>
            You haven't created any courses yet. Start by creating your first
            course!
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {courses.map((course) => (
              <div
                key={course._id}
                style={{
                  background: "#f8fafc",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <h3
                  style={{
                    color: "#1e293b",
                    marginBottom: 8,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {course.title}
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: 14,
                    marginBottom: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {course.description}
                </p>
                {course.content && (
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      marginBottom: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    {course.content.length > 100
                      ? course.content.substring(0, 100) + "..."
                      : course.content}
                  </p>
                )}
                <p
                  style={{
                    color: "#2563eb",
                    fontSize: 12,
                    fontWeight: 500,
                    marginBottom: 16,
                  }}
                >
                  Created by: {course.instructor?.username || "You"}
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => openStudentsModal(course)}
                    style={{
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    View Students
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => openEditModal(course)}
                    style={{
                      background: "#f59e0b",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(course)}
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Course Form Modal */}
      {showAddForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 16,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              width: "90%",
              maxWidth: 500,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2 style={{ color: "#2563eb", margin: 0 }}>Add New Course</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ title: "", description: "", content: "" });
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddCourse}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  disabled={formLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                  placeholder="Enter course title"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  disabled={formLoading}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    resize: "vertical",
                  }}
                  placeholder="Enter course description"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  disabled={formLoading}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    resize: "vertical",
                  }}
                  placeholder="Enter course content (optional)"
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    background:
                      "linear-gradient(90deg,#2563eb 60%,#61dafb 100%)",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: formLoading ? "not-allowed" : "pointer",
                    opacity: formLoading ? 0.7 : 1,
                    flex: 1,
                  }}
                >
                  {formLoading ? (
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
                      Creating...
                    </div>
                  ) : (
                    "Create Course"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ title: "", description: "", content: "" });
                  }}
                  disabled={formLoading}
                  style={{
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: formLoading ? "not-allowed" : "pointer",
                    opacity: formLoading ? 0.7 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 16,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              width: "90%",
              maxWidth: 500,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2 style={{ color: "#2563eb", margin: 0 }}>Edit Course</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCourse(null);
                  setFormData({ title: "", description: "", content: "" });
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditCourse}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  disabled={formLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                  placeholder="Enter course title"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  disabled={formLoading}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    resize: "vertical",
                  }}
                  placeholder="Enter course description"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  disabled={formLoading}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    resize: "vertical",
                  }}
                  placeholder="Enter course content (optional)"
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    background:
                      "linear-gradient(90deg,#2563eb 60%,#61dafb 100%)",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: formLoading ? "not-allowed" : "pointer",
                    opacity: formLoading ? 0.7 : 1,
                    flex: 1,
                  }}
                >
                  {formLoading ? (
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
                      Updating...
                    </div>
                  ) : (
                    "Update Course"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCourse(null);
                    setFormData({ title: "", description: "", content: "" });
                  }}
                  disabled={formLoading}
                  style={{
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: formLoading ? "not-allowed" : "pointer",
                    opacity: formLoading ? 0.7 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCourse && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 16,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              width: "90%",
              maxWidth: 400,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: "#dc2626", marginBottom: 16 }}>
              Delete Course
            </h2>
            <p style={{ color: "#6b7280", marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to delete "
              <strong>{selectedCourse.title}</strong>"? This action cannot be
              undone.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={handleDelete}
                disabled={deleteLoading[selectedCourse._id]}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: deleteLoading[selectedCourse._id]
                    ? "not-allowed"
                    : "pointer",
                  opacity: deleteLoading[selectedCourse._id] ? 0.7 : 1,
                }}
              >
                {deleteLoading[selectedCourse._id] ? (
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
                    Deleting...
                  </div>
                ) : (
                  "Yes, Delete"
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCourse(null);
                }}
                disabled={deleteLoading[selectedCourse._id]}
                style={{
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: deleteLoading[selectedCourse._id]
                    ? "not-allowed"
                    : "pointer",
                  opacity: deleteLoading[selectedCourse._id] ? 0.7 : 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudentsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 16,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              width: "90%",
              maxWidth: 800,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div>
                <h2 style={{ color: "#2563eb", margin: 0 }}>
                  Enrolled Students
                </h2>
                <p style={{ color: "#666", margin: "4px 0 0 0", fontSize: 14 }}>
                  {courseStudents.courseTitle} •{" "}
                  {courseStudents.totalStudents || 0} students
                </p>
              </div>
              <button
                onClick={() => {
                  setShowStudentsModal(false);
                  setCourseStudents([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            {studentsLoading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <LoadingSpinner text="Loading students..." />
              </div>
            ) : courseStudents.students &&
              courseStudents.students.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f8fafc",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        #
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Username
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Email
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Enrolled Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseStudents.students.map((student, index) => (
                      <tr
                        key={student.id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td
                          style={{
                            padding: "12px",
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            textAlign: "left",
                            padding: "12px",
                            color: "#1e293b",
                            fontWeight: 600,
                          }}
                        >
                          {student.username}
                        </td>
                        <td
                          style={{
                            textAlign: "left",
                            padding: "12px",
                            color: "#374151",
                          }}
                        >
                          {student.email}
                        </td>
                        <td
                          style={{
                            textAlign: "left",
                            padding: "12px",
                            color: "#6b7280",
                            fontSize: 13,
                          }}
                        >
                          {new Date(student.enrolledAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                <h3 style={{ marginBottom: 8, color: "#374151" }}>
                  No Students Enrolled
                </h3>
                <p>This course doesn't have any enrolled students yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
