import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingState from "../components/ui/LoadingState.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") navigate("/admin", { replace: true });
    if (user.role === "teacher") navigate("/teacher", { replace: true });
    if (user.role === "student") navigate("/student", { replace: true });
  }, [navigate, user]);

  return <LoadingState label="Opening your dashboard..." />;
};

export default Dashboard;
