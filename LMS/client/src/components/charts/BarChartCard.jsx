import React from "react";

const BarChartCard = ({ title, subtitle, data = [], accent = "from-cyan-400 to-violet-500" }) => {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-300">
              <span>{item.label}</span>
              <span className="font-semibold text-white">{item.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10">
              <div
                className={`h-2.5 rounded-full bg-gradient-to-r ${accent}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChartCard;
