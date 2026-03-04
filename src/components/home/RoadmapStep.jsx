import React from "react";
import { motion } from "framer-motion";

export default function RoadmapStep({ step, index, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="flex gap-4"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
          step.active ? "bg-purple-500 shadow-lg shadow-purple-500/30" : "bg-foreground/10"
        }`} />
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-foreground/10 to-transparent mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">{step.phase}</span>
        </div>
        <h4 className="font-semibold text-foreground text-sm">{step.title}</h4>
        <p className="text-xs text-foreground/45 mt-1 leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}