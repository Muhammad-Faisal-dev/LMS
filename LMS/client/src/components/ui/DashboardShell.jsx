import React from "react";
import { Link } from "react-router-dom";
import { getRoleTheme } from "../../utils/ui";

const DashboardShell = ({
  role = "student",
  title,
  subtitle,
  tabs = [],
  actions,
  stats,
  children,
}) => {
  const theme = getRoleTheme(role);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className={`overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br ${theme.panel} p-6 shadow-2xl shadow-slate-950/30`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ring-1 ${theme.badge}`}>
              {role} workspace
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              {subtitle}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {tabs.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                  tab.active
                    ? `border-transparent bg-gradient-to-r ${theme.accent} text-white shadow-lg shadow-cyan-500/10`
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
                {tab.badge ? (
                  <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-xs">
                    {tab.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>

      {stats ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats}</div> : null}

      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
};

export default DashboardShell;
