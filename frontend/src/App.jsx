import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, lazy, Suspense, useEffect } from "react";
import { getToken, getUserRole } from "./common-function/token";
import LoadingPage from "./pages/LoadingPage";
import "./App.css";

// Lazy-loaded pages
const Register = lazy(() => import("./pages/register"));
const Login = lazy(() => import("./pages/login"));
const CourseList = lazy(() => import("./pages/CourseList"));
const EnrolledCourses = lazy(() => import("./pages/EnrolledCourses"));
const InstructorDashboard = lazy(() => import("./pages/InstructorDashboard"));
const ForgotPassword = lazy(() => import("./pages/forgot-password"));
const ResetPassword = lazy(() => import("./pages/reset-password"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CourseRecommendations = lazy(() =>
  import("./components/CourseRecommendations")
);

function App() {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const role = getUserRole();
  const token = getToken();

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated on app load
    if (token) {
      setAuth(true);
    }
    setLoading(false);
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(false);
    navigate("/login");
  };

  if (loading) {
    return (
      <LoadingPage
        title="Loading Application"
        subtitle="Checking authentication..."
      />
    );
  }

  return (
    <div>
      <nav>
        {!auth ? (
          <>
            <Link to="/register">Register</Link> |{" "}
            <Link to="/login">Login</Link>
          </>
        ) : (
          <>
            <Link to="/courses">Courses</Link> |{" "}
            {role === "admin" ? (
              <Link to="/admin">Admin Dashboard</Link>
            ) : role === "instructor" ? (
              <Link to="/instructor">Instructor Dashboard</Link>
            ) : (
              <>
                <Link to="/enrolled">My Courses</Link> |{" "}
                <Link to="/student">Student Dashboard</Link> |{" "}
                <Link to="/recommendations">AI Recommendations</Link>
              </>
            )}
            <button onClick={logout} style={{ marginLeft: 8 }}>
              Logout
            </button>
          </>
        )}
      </nav>

      <Suspense
        fallback={
          <LoadingPage title="Loading Page" subtitle="Please wait..." />
        }
      >
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/register" element={<Register setAuth={setAuth} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/enrolled" element={<EnrolledCourses />} />
          <Route
            path="/instructor"
            element={<InstructorDashboard setAuth={setAuth} />}
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/recommendations" element={<CourseRecommendations />} />
          <Route path="*" element={<Login setAuth={setAuth} />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
