import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  { id: "auth", label: "Verifying identity" },
  { id: "wallet", label: "Checking wallet" },
  { id: "generate", label: "Generating metadata" },
  { id: "mint", label: "Minting on-chain" },
  { id: "confirm", label: "Confirming transaction" },
];

export default function MintProgress({ currentStep }) {
  // currentStep is 0-based index, -1 = not started, 5 = done
  return (
    <div className="w-full py-4 space-y-2">
      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              active ? "bg-purple-500/10" : done ? "opacity-60" : "opacity-25"
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
              done
                ? "bg-green-500/20 border-green-500/40"
                : active
                ? "bg-purple-500/20 border-purple-500/40"
                : "bg-white/[0.04] border-white/10"
            }`}>
              {done ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : active ? (
                <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              )}
            </div>
            <span className={`text-sm ${active ? "text-white font-medium" : done ? "text-white/50" : "text-white/25"}`}>
              {step.label}
            </span>
            {active && (
              <motion.div
                className="ml-auto flex gap-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    className="w-1 h-1 rounded-full bg-purple-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2 }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}