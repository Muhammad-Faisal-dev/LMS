import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, reset } from "../features/auth/authSlice.jsx";

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

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [emailError, setEmailError] = useState("");

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      // Error is already handled in the component
    }

    // Redirect when logged in
    if (isSuccess && user) {
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "teacher":
          navigate("/teacher");
          break;
        case "student":
          navigate("/student");
          break;
        default:
          navigate("/dashboard");
      }
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

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Login to Your Account
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

          <form onSubmit={onSubmit}>
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

            <div className="mb-6">
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

            <div className="flex items-center justify-between">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={isLoading || emailError}
              >
                {isLoading ? "Logging in..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
