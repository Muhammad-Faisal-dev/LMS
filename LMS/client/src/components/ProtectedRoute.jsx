import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingState from "./ui/LoadingState.jsx";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <LoadingState label="Checking your access..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher" replace />;
    if (user.role === "student") return <Navigate to="/student" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
