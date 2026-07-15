import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
      <div className="rounded-[34px] border border-white/10 bg-slate-900/70 px-8 py-14 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">This page drifted out of your course map.</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
          The route you opened does not exist anymore or needs a different access role. Head back to the home page and continue from there.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Return home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
