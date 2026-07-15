import React from "react";
import { useTheme } from "../../context/useTheme.jsx";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
      title="Toggle theme"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
    </button>
  );
};

const SunIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v2.25M12 18.75V21M4.636 4.636l1.591 1.591M17.773 17.773l1.591 1.591M3 12h2.25M18.75 12H21M4.636 19.364l1.591-1.591M17.773 6.227l1.591-1.591" />
    <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12.79A9 9 0 1111.21 3c0 .34.02.68.05 1.01A7 7 0 0021 12.79z" />
  </svg>
);

export default ThemeToggle;
