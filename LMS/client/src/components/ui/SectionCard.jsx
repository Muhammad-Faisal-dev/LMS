import React from "react";

const SectionCard = ({ title, subtitle, action, children, className = "" }) => {
  return (
    <section
      className={`rounded-[30px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/25 backdrop-blur-xl ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-xl font-semibold text-white">{title}</h2> : null}
            {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          {action ? <div className="sm:shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
};

export default SectionCard;
