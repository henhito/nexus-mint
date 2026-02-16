import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Hexagon } from "lucide-react";
import { format } from "date-fns";

export default function NFTCard({ mint, index, network }) {
  const explorerBase = network === "mainnet"
    ? "https://polygonscan.com/tx/"
    : "https://amoy.polygonscan.com/tx/";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-2xl overflow-hidden group hover:border-purple-500/20 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-indigo-900/20 relative overflow-hidden">
        {mint.image_url ? (
          <img
            src={mint.image_url}
            alt={mint.nft_name || `NFT #${mint.token_id}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Hexagon className="w-12 h-12 text-purple-500/20" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`
            text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full
            ${mint.status === "confirmed" ? "bg-green-500/20 text-green-400" : ""}
            ${mint.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : ""}
            ${mint.status === "failed" ? "bg-red-500/20 text-red-400" : ""}
          `}>
            {mint.status}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm truncate">
          {mint.nft_name || `Genesis #${mint.token_id || "?"}`}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/30">
            {mint.mint_date ? format(new Date(mint.mint_date), "MMM d, yyyy") : ""}
          </span>
          {mint.tx_hash && (
            <a
              href={`${explorerBase}${mint.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400/60 hover:text-purple-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}