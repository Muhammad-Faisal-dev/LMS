import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, reset } from "../features/auth/authSlice.jsx";
import { getDashboardLink } from "../utils/ui.js";

const isValidGmailAddress = (email) => {
  if (!email) return false;
  const gmailRegex = /^[a-zA-Z0-9][a-zA-Z0-9.+_-]+@gmail\.com$/i;
  if (!gmailRegex.test(email)) return false;
  const username = email.split("@")[0];
  return !username.includes("..") && username.length <= 64;
};

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  const destination = useMemo(() => getDashboardLink(user), [user]);

  useEffect(() => {
    if (isSuccess && user) {
      navigate(destination);
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, destination, isSuccess, navigate, user]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") setEmailError("");
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
    dispatch(login(formData));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.18),_transparent_32%)]" />
          <div className="relative">
            <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
              Welcome back
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
              Sign in to your learning workspace.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
              Access your dashboard, courses, approvals, messages, and everything you need to manage modern learning in one polished platform.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Role-based dashboards for admin, teacher and student",
                "Approval workflow and cohort assignment for new students",
                "Course materials, assignments and progress tracking",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-semibold text-white">Account login</h2>
            <p className="mt-2 text-sm text-slate-400">
              Use your approved Gmail account to continue.
            </p>

            {isError ? (
              <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {message}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Gmail address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  onBlur={validateEmail}
                  placeholder="example123@gmail.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/[0.07]"
                  required
                />
                {emailError ? <p className="mt-2 text-xs text-rose-200">{emailError}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/[0.07]"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={isLoading || Boolean(emailError)}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 px-4 py-3 font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Signing you in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Don’t have an account?{" "}
              <Link to="/register" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
