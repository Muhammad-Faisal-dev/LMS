import React from "react";

const LoadingState = ({ label = "Loading your workspace..." }) => {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-white/10 bg-slate-900/70 px-6 text-center shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
      <div>
        <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-white/15 border-t-cyan-400" />
        <p className="text-base font-medium text-slate-100">{label}</p>
        <p className="mt-2 text-sm text-slate-400">
          Please wait while we prepare the latest data.
        </p>
      </div>
    </div>
  );
};

export default LoadingState;
