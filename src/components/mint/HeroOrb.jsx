import React from "react";
import { motion } from "framer-motion";

export default function HeroOrb() {
  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
      {/* Outer glow ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, rgba(168,85,247,0.3), rgba(99,102,241,0.1), rgba(6,182,212,0.3), rgba(168,85,247,0.3))",
        }}
      />
      
      {/* Inner dark circle */}
      <div className="absolute inset-2 rounded-full bg-[hsl(var(--background))]" />
      
      {/* Core orb */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-6 rounded-full overflow-hidden"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(168,85,247,0.2) 0%, rgba(99,102,241,0.1) 40%, rgba(0,0,0,0.8) 100%)",
        }}
      >
        {/* Highlight */}
        <div
          className="absolute top-[15%] left-[20%] w-[30%] h-[20%] rounded-full blur-xl"
          style={{ background: "rgba(168,85,247,0.4)" }}
        />
        <div
          className="absolute bottom-[25%] right-[15%] w-[25%] h-[15%] rounded-full blur-lg"
          style={{ background: "rgba(6,182,212,0.2)" }}
        />
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-400/60"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}