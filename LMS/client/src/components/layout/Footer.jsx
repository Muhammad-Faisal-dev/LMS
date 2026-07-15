import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-semibold text-slate-200">LMS Platform</p>
          <p className="mt-1">
            Designed for ambitious educators, modern classrooms, and a premium digital learning experience.
          </p>
        </div>
        <p>© {new Date().getFullYear()} LMS Platform. Built with React, Node and MongoDB.</p>
      </div>
    </footer>
  );
};

export default Footer;
