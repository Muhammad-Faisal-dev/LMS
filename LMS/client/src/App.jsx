import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe } from "./features/auth/authSlice.jsx";

// Layout Components
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

// Role-based Dashboards
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import TeacherDashboard from "./pages/teacher/Dashboard.jsx";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import StudentMessages from "./pages/student/Messages.jsx";
import TeacherMessages from "./pages/teacher/Messages.jsx";

// Course Pages
import TeacherCourses from "./pages/teacher/Courses.jsx";
import StudentCourses from "./pages/student/Courses.jsx";

// Admin Pages
import PendingApprovals from "./pages/admin/PendingApprovals.jsx";
import SendMessage from "./pages/admin/SendMessage.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ManageCourses from "./pages/admin/ManageCourses.jsx";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Extra debug panel for API testing
import DebugPanel from "./pages/DebugPanel.jsx";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/debug" element={<DebugPanel />} />

            {/* Generic Dashboard - Will redirect based on role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pending-approvals"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PendingApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/send-message"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SendMessage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-courses"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageCourses />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/courses"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/messages"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherMessages />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/messages"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentMessages />
                </ProtectedRoute>
              }
            />

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
