import React from "react";

const BrandLogo = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-cyan-500/20">
        <div className="absolute inset-[1px] rounded-[15px] bg-slate-950/90" />
        <span className="relative text-sm font-black tracking-[0.32em] text-white">
          LMS
        </span>
      </div>

      {!compact && (
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Premium Suite
          </p>
          <p className="text-lg font-semibold text-white">LMS Platform</p>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
