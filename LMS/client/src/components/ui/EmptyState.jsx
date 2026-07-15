import React from "react";

const EmptyState = ({
  title,
  description,
  action,
  icon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="h-7 w-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M12 6v12m6-6H6"
      />
    </svg>
  ),
}) => {
  return (
    <div className="rounded-[28px] border border-dashed border-white/10 bg-slate-900/60 px-8 py-12 text-center shadow-xl shadow-slate-950/20 backdrop-blur-xl">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-cyan-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
