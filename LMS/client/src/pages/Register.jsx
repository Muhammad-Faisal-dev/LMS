import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../features/auth/authSlice.jsx";

const isValidGmailAddress = (email) => {
  if (!email) return false;
  const gmailRegex = /^[a-zA-Z0-9][a-zA-Z0-9.+_-]+@gmail\.com$/i;
  if (!gmailRegex.test(email)) return false;
  const username = email.split("@")[0];
  return !username.includes("..") && username.length <= 64;
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
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess) {
      navigate("/login");
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isSuccess, navigate]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") setEmailError("");
    if (name === "password" || name === "confirmPassword") setPasswordError("");
  };

  const validateEmail = () => {
    if (formData.email && !isValidGmailAddress(formData.email)) {
      setEmailError("Please enter a valid Gmail address.");
      return false;
    }

    setEmailError("");
    return true;
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (!validateEmail()) return;

    if (formData.password.length < 6) {
      setPasswordError("Password should be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    dispatch(
      register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.2),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.18),_transparent_26%)]" />
          <div className="relative">
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
              Join the platform
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
              Create a polished LMS account experience.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Student and teacher accounts require admin approval, while the first admin account can unlock the whole system setup.
            </p>

            <div className="mt-10 grid gap-4">
              {[
                { title: "Students", text: "Receive cohort assignment, view courses, track materials and stay updated." },
                { title: "Teachers", text: "Manage course delivery, upload materials and publish assignments." },
                { title: "Admins", text: "Approve members, manage users and operate the complete LMS." },
              ].map((item) => (
                <div key={item.title} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <div className="mx-auto max-w-xl">
            <h2 className="text-2xl font-semibold text-white">Registration form</h2>
            <p className="mt-2 text-sm text-slate-400">
              Use a valid Gmail account and choose the right role for your LMS access.
            </p>

            {isError ? (
              <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {message}
              </div>
            ) : null}

            {isSuccess ? (
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                Registration successful. Please wait for admin approval before logging in.
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-200">Full name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  placeholder="Muhammad Faisal"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/[0.07]"
                  required
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-200">Gmail address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  onBlur={validateEmail}
                  placeholder="example123@gmail.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/[0.07]"
                  required
                />
                {emailError ? <p className="mt-2 text-xs text-rose-200">{emailError}</p> : null}
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/[0.07]"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-200">Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={onChange}
                  placeholder="Repeat password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-white/[0.07]"
                  required
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-200">Register as</span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={onChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:bg-white/[0.07]"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="mt-2 text-xs text-slate-400">
                  {formData.role === "admin"
                    ? "Only the first admin account can be created in the system."
                    : `${formData.role === "student" ? "Student" : "Teacher"} accounts need approval before login.`}
                </p>
              </label>

              {passwordError ? (
                <div className="sm:col-span-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {passwordError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading || Boolean(emailError)}
                className="sm:col-span-2 w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 px-4 py-3 font-semibold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Creating your account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
