import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "teacher":
        return <Navigate to="/teacher" replace />;
      case "student":
        return <Navigate to="/student" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
