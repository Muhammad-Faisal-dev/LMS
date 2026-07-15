import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  const getDashboardLink = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "admin":
        return "/admin";
      case "teacher":
        return "/teacher";
      case "student":
        return "/student";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 bg-gradient-to-r from-primary-700 to-primary-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Learning Management System
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            A comprehensive platform for students, teachers, and administrators
            to manage educational content and communication.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="bg-green-500 text-primary-700 hover:bg-green-700  px-6 py-3 rounded-md font-semibold shadow-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 border border-white px-6 py-3 rounded-md font-semibold shadow-md"
                >
                  Register
                </Link>
              </>
            ) : (
              <Link
                to={getDashboardLink()}
                className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-md font-semibold shadow-md"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
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
              <h3 className="text-xl font-semibold mb-2">Course Management</h3>
              <p className="text-gray-600">
                Create, organize, and manage courses with ease. Add materials,
                assignments, and track student progress.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
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
              <h3 className="text-xl font-semibold mb-2">Messaging System</h3>
              <p className="text-gray-600">
                Communicate effectively with targeted messaging to students,
                teachers, or both groups simultaneously.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
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
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Secure role-based access control for administrators, teachers,
                and students with unique IDs and approval system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our learning management system today and experience a better
            way to teach and learn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700  px-6 py-3 rounded-md font-semibold shadow-md"
                >
                  Create an Account
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-blue-700 hover:bg-gray-100 border border-blue-600 px-6 py-3 rounded-md font-semibold shadow-md"
                >
                  Login
                </Link>
              </>
            ) : (
              <Link
                to={getDashboardLink()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold shadow-md"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
