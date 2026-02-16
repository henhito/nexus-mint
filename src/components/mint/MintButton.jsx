import React from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

export default function MintButton({ onClick, isMinting, disabled, mintCount, maxMints }) {
  const remaining = maxMints - mintCount;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        onClick={onClick}
        disabled={disabled || isMinting}
        className={`
          relative px-12 py-4 rounded-2xl text-base font-semibold tracking-wide
          transition-all duration-300
          ${disabled
            ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white mint-pulse hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
          }
        `}
      >
        <span className="flex items-center gap-2.5">
          {isMinting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Mint NFT — Free
            </>
          )}
        </span>
      </motion.button>

      <p className="text-xs text-white/30">
        {remaining > 0
          ? `${remaining} of ${maxMints} mints remaining for your account`
          : "You've reached your mint limit"
        }
      </p>
    </div>
  );
}