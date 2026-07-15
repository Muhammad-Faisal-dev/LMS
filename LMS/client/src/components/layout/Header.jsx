import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice.jsx";
import React from "react";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    navigate("/");
  };

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

  // Helper function to safely capitalize the role
  const capitalizeRole = (role) => {
    return role && typeof role === "string"
      ? role.charAt(0).toUpperCase() + role.slice(1)
      : "";
  };

  return (
    <header className="bg-primary-700  shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold ">
            LMS
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-primary-200">
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="hover:text-primary-200"
                >
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center hover:text-primary-200">
                    <span className="mr-1">{user.name}</span>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {capitalizeRole(user.role)}
                      </p>
                      {user.uniqueId && (
                        <p className="text-xs text-gray-500">
                          ID: {user.uniqueId}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-200">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-primary-600">
            <Link to="/" className="block py-2 hover:text-primary-200">
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block py-2 hover:text-primary-200"
                >
                  Dashboard
                </Link>
                <div className="py-2">
                  <div className="mb-2">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-primary-200">
                      {capitalizeRole(user.role)}
                    </p>
                    {user.uniqueId && (
                      <p className="text-xs text-primary-200">
                        ID: {user.uniqueId}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onLogout}
                    className="text-white hover:text-primary-200"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 hover:text-primary-200">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 hover:text-primary-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
