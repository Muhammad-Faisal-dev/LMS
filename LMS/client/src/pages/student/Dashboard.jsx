// import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import React from "react";

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="mb-4">Welcome, {user?.name}!</p>
        <p className="mb-4">Student ID: {user?.uniqueId}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h2 className="text-lg font-semibold mb-4">My Courses</h2>
            <p className="text-gray-600">Access your enrolled courses</p>
            <Link to="/student/courses">
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              View Courses
            </button>
            </Link>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h2 className="text-lg font-semibold mb-4">Messages</h2>
            <p className="text-gray-600">View messages from administrators</p>
            <Link to="/student/messages">
            <button className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              View Messages
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
