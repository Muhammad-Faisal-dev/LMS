import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import React from "react";

// Admin components
import PendingApprovals from "./PendingApprovals";
import SendMessage from "./SendMessage";
// import ManageUsers from "./ManageUsers";
import ManageCourses from "./ManageCourses";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalUsers: 0,
    totalCourses: 0,
    totalMessages: 0,
  });

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Get pending approvals count
        const pendingRes = await axios.get(
          "http://localhost:5000/api/users/pending",
          config
        );

        // Get all users count
        const usersRes = await axios.get(
          "http://localhost:5000/api/users",
          config
        );

        // Get all courses count
        const coursesRes = await axios.get(
          "http://localhost:5000/api/courses",
          config
        );

        // Get all messages count
        const messagesRes = await axios.get(
          "http://localhost:5000/api/messages/admin",
          config
        );

        setStats({
          pendingApprovals: pendingRes.data.count,
          totalUsers: usersRes.data.count,
          totalCourses: coursesRes.data.count,
          totalMessages: messagesRes.data.count,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="flex flex-col md:flex-row ">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-800 text-white p-6 md:min-h-[80vh] rounded-lg">
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin"
                className="block py-2 px-4 rounded hover:bg-primary-700"
              >
                Overview
              </Link>
            </li>
            <li>
              <Link
                to="/admin/pending-approvals"
                className="block py-2 px-4 rounded hover:bg-primary-700"
              >
                Pending Approvals
                {stats.pendingApprovals > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.pendingApprovals}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/send-message"
                className="block py-2 px-4 rounded hover:bg-primary-700"
              >
                Send Message
              </Link>
            </li>
            {/* <li>
              <Link
                to="/admin/manage-users"
                className="block py-2 px-4 rounded hover:bg-primary-700"
              >
                Manage Users
              </Link>
            </li> */}
            <li>
              <Link
                to="/admin/manage-courses"
                className="block py-2 px-4 rounded hover:bg-primary-700"
              >
                Manage Courses
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<AdminOverview stats={stats} />} />
          <Route path="/pending-approvals" element={<PendingApprovals />} />
          <Route path="/send-message" element={<SendMessage />} />
          {/* <Route path="/manage-users" element={<ManageUsers />} /> */}
          <Route path="/manage-courses" element={<ManageCourses />} />
        </Routes>
      </div>
    </div>
  );
};

// Admin Overview Component
const AdminOverview = ({ stats }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Approvals Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-semibold text-gray-700">
                {stats.pendingApprovals}
              </p>
            </div>
          </div>
          <Link
            to="/admin/pending-approvals"
            className="mt-4 text-sm text-primary-600 hover:text-primary-800 block"
          >
            View pending approvals →
          </Link>
        </div>

        {/* Total Users Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-700">
                {stats.totalUsers}
              </p>
            </div>
          </div>
          <Link
            to="/admin/manage-users"
            className="mt-4 text-sm text-primary-600 hover:text-primary-800 block"
          >
            Manage users →
          </Link>
        </div>

        {/* Total Courses Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-700">
                {stats.totalCourses}
              </p>
            </div>
          </div>
          <Link
            to="/admin/manage-courses"
            className="mt-4 text-sm text-primary-600 hover:text-primary-800 block"
          >
            Manage courses →
          </Link>
        </div>

        {/* Total Messages Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                ></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-2xl font-semibold text-gray-700">
                {stats.totalMessages}
              </p>
            </div>
          </div>
          <Link
            to="/admin/send-message"
            className="mt-4 text-sm text-primary-600 hover:text-primary-800 block"
          >
            Send new message →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
