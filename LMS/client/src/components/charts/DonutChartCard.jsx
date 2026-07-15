import React from "react";

const DonutChartCard = ({ title, subtitle, value = 0, total = 100, color = "#22d3ee", trail = "rgba(255,255,255,0.1)" }) => {
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.min(value / total, 1) : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
      <div className="mt-6 flex items-center gap-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trail} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div>
          <p className="text-3xl font-semibold text-white">{total > 0 ? Math.round(progress * 100) : 0}%</p>
          <p className="mt-2 text-sm text-slate-400">{value} of {total} completed</p>
        </div>
      </div>
    </div>
  );
};

export default DonutChartCard;
