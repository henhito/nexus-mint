import React from "react";

export default function StatBadge({ label, value, icon: Icon }) {
  return (
    <div className="glass rounded-xl px-5 py-4 flex items-center gap-3 min-w-[140px]">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-purple-400" />
        </div>
      )}
      <div>
        <div className="text-xs text-foreground/50 uppercase tracking-wider font-medium">{label}</div>
        <div className="text-lg font-semibold text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  );
}