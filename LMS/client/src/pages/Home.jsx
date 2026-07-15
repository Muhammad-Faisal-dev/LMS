import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import BrandLogo from "../components/ui/BrandLogo.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { getDashboardLink } from "../utils/ui.js";

const featureCards = [
  {
    title: "Executive dashboards",
    description:
      "Beautiful role-based workspaces for admins, teachers, and students with metrics, shortcuts, and a polished visual hierarchy.",
  },
  {
    title: "Course delivery",
    description:
      "Create courses, attach materials, publish assignments, and keep every lesson organized in a premium learning interface.",
  },
  {
    title: "Messaging and approvals",
    description:
      "Approve new users, assign student cohorts, and communicate with targeted announcements that look production-ready.",
  },
];

const roles = [
  {
    label: "Admin",
    title: "Control the entire learning operation",
    description:
      "Approve users, manage courses, assign teachers, and track activity from one elegant command center.",
  },
  {
    label: "Teacher",
    title: "Run courses with confidence",
    description:
      "Upload materials, set assignments, monitor enrolled learners, and keep classes moving forward.",
  },
  {
    label: "Student",
    title: "Learn through a guided digital journey",
    description:
      "Track course progress, access resources, view deadlines, and stay updated through a focused inbox.",
  },
];

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const dashboardLink = getDashboardLink(user);

  return (
    <div className="pb-12">
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Premium LMS redesign ready for launch
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Turn your LMS into a product people instantly trust.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Your backend is already in place. This interface upgrades it into a polished learning platform with modern dashboards,
              premium visuals, better UX, and workflows that feel ready for real users.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5"
                  >
                    Create account
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <Link
                  to={dashboardLink}
                  className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Open my dashboard
                </Link>
              )}
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <StatCard
                label="Design language"
                value="Premium"
                hint="Glassmorphism, gradients, depth, and stronger structure."
                accent="from-cyan-400 to-sky-500"
                icon={<SparkIcon />}
              />
              <StatCard
                label="LMS features"
                value="Expanded"
                hint="Assignments, cohort approvals, better course management."
                accent="from-violet-500 to-fuchsia-500"
                icon={<CubeIcon />}
              />
              <StatCard
                label="Ready for demos"
                value="Yes"
                hint="Great for portfolio, internships, and client presentations."
                accent="from-emerald-400 to-teal-500"
                icon={<RocketIcon />}
              />
            </div>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <BrandLogo />
            <div className="mt-8 space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Admin overview</p>
                    <p className="mt-2 text-2xl font-semibold text-white">1 dashboard, full control</p>
                  </div>
                  <div className="rounded-2xl bg-fuchsia-500/15 px-3 py-2 text-xs font-semibold text-fuchsia-200">
                    Live analytics
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm text-slate-400">Teacher tools</p>
                  <p className="mt-2 font-semibold text-white">Materials + assignments</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">Keep learning resources structured and publish deadlines clearly.</p>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm text-slate-400">Student journey</p>
                  <p className="mt-2 font-semibold text-white">Progress tracking</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">Learners can track material completion and stay focused on outcomes.</p>
                </div>
              </div>
              <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/10 p-5 text-sm leading-7 text-cyan-100">
                This version is focused on visual quality, clearer information architecture, and features that make the LMS feel closer to a real SaaS product.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionCard
          title="Built for every role"
          subtitle="Each user gets a dedicated workflow with a premium interface and meaningful actions."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {roles.map((role) => (
              <div key={role.label} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {role.label}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">{role.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{role.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <SectionCard key={feature.title} title={feature.title} className="h-full">
              <p className="text-sm leading-7 text-slate-400">{feature.description}</p>
            </SectionCard>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 p-8 text-center shadow-2xl shadow-slate-950/20">
          <h2 className="text-3xl font-semibold text-white">Make your LMS portfolio-worthy</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            The foundation is already good. With a stronger interface and better workflows, you can present it as a serious product to recruiters, clients, and the world.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to={user ? dashboardLink : "/register"}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              {user ? "Go to my workspace" : "Start building"}
            </Link>
            {!user ? (
              <Link
                to="/login"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Existing user login
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

const SparkIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3l1.9 5.9H20l-4.8 3.5 1.8 5.8-5-3.6-5 3.6 1.8-5.8L4 8.9h6.1L12 3z" />
  </svg>
);

const CubeIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3.3 7l8.7 5 8.7-5M12 22V12" />
  </svg>
);

const RocketIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 16.5c-1.5 1.5-1.5 4.5-1.5 4.5s3 0 4.5-1.5 1.5-4.5 1.5-4.5-3 0-4.5 1.5zm12-12L9 12l3 3 7.5-7.5a6.364 6.364 0 001.5-5.5 6.364 6.364 0 00-5.5 1.5z" />
  </svg>
);

export default Home;
