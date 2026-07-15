import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe } from "./features/auth/authSlice.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import DebugPanel from "./pages/DebugPanel.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import Register from "./pages/Register.jsx";
import Settings from "./pages/Settings.jsx";
import Notifications from "./pages/Notifications.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ManageCourses from "./pages/admin/ManageCourses.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import PendingApprovals from "./pages/admin/PendingApprovals.jsx";
import SendMessage from "./pages/admin/SendMessage.jsx";

import StudentCourses from "./pages/student/Courses.jsx";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import StudentMessages from "./pages/student/Messages.jsx";

import TeacherCourses from "./pages/teacher/Courses.jsx";
import TeacherDashboard from "./pages/teacher/Dashboard.jsx";
import TeacherMessages from "./pages/teacher/Messages.jsx";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
    <Router>
      <div className="app-shell min-h-screen text-white">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/debug" element={<DebugPanel />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
