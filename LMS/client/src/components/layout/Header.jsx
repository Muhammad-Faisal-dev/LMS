import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice.jsx";
import BrandLogo from "../ui/BrandLogo.jsx";
import NotificationBell from "../notifications/NotificationBell.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import { capitalize, getDashboardLink, getInitials } from "../../utils/ui.js";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardLink = useMemo(() => getDashboardLink(user), [user]);

  const mainLinks = user
    ? [
        { label: "Home", to: "/" },
        { label: "Dashboard", to: dashboardLink },
        { label: "Notifications", to: "/notifications" },
        { label: "Settings", to: "/settings" },
      ]
    : [
        { label: "Home", to: "/" },
        { label: "Login", to: "/login" },
        { label: "Register", to: "/register" },
      ];

  const onLogout = () => {
    dispatch(logout());
    navigate("/");
    setMobileOpen(false);
  };

  const navClass = ({ isActive }) =>
    `rounded-2xl px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <BrandLogo compact={false} />
          </Link>

          <nav className="hidden items-center gap-2 xl:flex">
            {mainLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <ThemeToggle />
            {user ? <NotificationBell /> : null}
            {user ? (
              <>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 font-semibold text-slate-950">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">
                      {capitalize(user.role)}{user.uniqueId ? ` • ${user.uniqueId}` : ""}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={onLogout}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/register"
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px]"
              >
                Start now
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10 xl:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen ? (
          <div className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/95 p-4 xl:hidden">
            <div className="mb-4 flex flex-wrap gap-3">
              <ThemeToggle />
              {user ? <NotificationBell /> : null}
            </div>
            <div className="space-y-2">
              {mainLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="mb-4 rounded-2xl bg-white/5 px-4 py-3">
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-slate-400">
                    {capitalize(user.role)}{user.uniqueId ? ` • ${user.uniqueId}` : ""}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
