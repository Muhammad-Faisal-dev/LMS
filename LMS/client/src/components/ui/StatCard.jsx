import React from "react";

const StatCard = ({ label, value, hint, icon, accent = "from-cyan-400 to-violet-500" }) => {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
          {hint ? <p className="mt-3 text-sm text-slate-400">{hint}</p> : null}
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${accent} p-[1px]`}>
          <div className="rounded-[15px] bg-slate-950/90 p-3 text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
