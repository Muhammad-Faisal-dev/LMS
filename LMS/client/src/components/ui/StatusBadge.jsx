import React from "react";

const styles = {
  success: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/20",
  warning: "bg-amber-500/15 text-amber-200 ring-amber-400/20",
  info: "bg-sky-500/15 text-sky-200 ring-sky-400/20",
  danger: "bg-rose-500/15 text-rose-200 ring-rose-400/20",
  neutral: "bg-white/10 text-slate-200 ring-white/10",
};

const StatusBadge = ({ children, tone = "neutral" }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[tone]}`}
    >
      {children}
    </span>
  );
};

export default StatusBadge;
