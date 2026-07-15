import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { register, reset } from "../features/auth/authSlice.jsx";
import React from "react";

// Gmail validator function
const isValidGmailAddress = (email) => {
  if (!email) return false;

  // Gmail validation regex
  const gmailRegex = /^[a-zA-Z0-9][a-zA-Z0-9.+_-]+@gmail\.com$/i;

  // Basic validation
  if (!gmailRegex.test(email)) return false;

  // Additional specific Gmail validations
  const username = email.split("@")[0];

  // Cannot have consecutive dots
  if (username.includes("..")) return false;

  // Maximum length for Gmail username is 64 characters
  if (username.length > 64) return false;

  return true;
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [emailError, setEmailError] = useState("");

  const { name, email, password, confirmPassword, role } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      // Error is already handled in the component
    }

    // Redirect when registered
    if (isSuccess) {
      navigate("/login");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear email error when user starts typing again
    if (name === "email") {
      setEmailError("");
    }
  };

  // Validate email when the field loses focus
  const validateEmail = () => {
    if (email && !isValidGmailAddress(email)) {
      setEmailError(
        "Please enter a valid Gmail address (example123@gmail.com)"
      );
      return false;
    }
    setEmailError("");
    return true;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validate email format first
    if (!validateEmail()) {
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
    } else {
      const userData = {
        name,
        email,
        password,
        role,
      };

      dispatch(register(userData));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Create an Account
          </h1>

          {isError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Registration successful. Please wait for admin approval.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                id="name"
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="Full Name"
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Gmail Address <span className="text-red-500">*</span>
              </label>
              <input
                className={`shadow appearance-none border ${
                  emailError ? "border-red-500" : ""
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 ${
                  emailError ? "focus:ring-red-500" : "focus:ring-primary-500"
                }`}
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                onBlur={validateEmail}
                placeholder="example123@gmail.com"
                required
              />
              {emailError && (
                <p className="text-red-500 text-xs italic mt-1">{emailError}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Only Gmail addresses are supported (example123@gmail.com)
              </p>
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Confirm Password"
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="role"
              >
                Register as
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                  id="role"
                  name="role"
                  value={role}
                  onChange={onChange}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {role !== "admin" && (
                <p className="text-xs text-gray-500 mt-1">
                  Note: {role === "student" ? "Student" : "Teacher"} accounts
                  require admin approval before login.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={isLoading || emailError}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
