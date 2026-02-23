import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ImageOff } from "lucide-react";

export default function NFTPreviewCard({ imageUrl, name, tokenId, isMinting }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl overflow-hidden aspect-square w-full max-w-xs mx-auto"
    >
      {/* Glow border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/30 via-indigo-500/20 to-cyan-500/20 p-[1px]">
        <div className="w-full h-full rounded-2xl bg-[hsl(var(--card))]" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Image area */}
        <div className="flex-1 relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name || "Genesis NFT"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              {isMinting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-400"
                  />
                  <p className="text-xs text-white/30">Generating artwork…</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-purple-400/60" />
                  </div>
                  <p className="text-xs text-white/25">Preview unavailable</p>
                </>
              )}
            </div>
          )}

          {/* Shimmer overlay while minting */}
          {isMinting && !imageUrl && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        {/* Info bar */}
        <div className="px-3 py-2 bg-[hsl(var(--card))] rounded-b-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white leading-tight">{name || "Genesis NFT"}</p>
            <p className="text-[10px] text-white/30">GenesisNFT Collection</p>
          </div>
          {tokenId && (
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">
              #{tokenId}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}