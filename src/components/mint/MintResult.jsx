import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, CheckCircle2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MintResult({ result, network }) {
  const [copied, setCopied] = React.useState(false);

  if (!result) return null;

  const explorerBase = network === "mainnet"
    ? "https://polygonscan.com/tx/"
    : "https://amoy.polygonscan.com/tx/";

  const handleCopy = () => {
    navigator.clipboard.writeText(result.tx_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 max-w-md mx-auto mt-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Mint Successful!</h3>
          <p className="text-xs text-white/40">Your NFT has been minted</p>
        </div>
      </div>

      {result.image_url && (
        <div className="rounded-xl overflow-hidden mb-4 aspect-square bg-white/[0.03]">
          <img src={result.image_url} alt={result.nft_name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-3">
        {result.nft_name && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/40">Name</span>
            <span className="text-white font-medium">{result.nft_name}</span>
          </div>
        )}
        {result.token_id && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/40">Token ID</span>
            <span className="text-white font-mono">#{result.token_id}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/40">Network</span>
          <span className="text-white capitalize">{network || "amoy"}</span>
        </div>
        {result.tx_hash && (
          <div className="pt-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Transaction Hash</span>
              <button onClick={handleCopy} className="text-white/40 hover:text-white transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <code className="text-xs text-purple-300 font-mono break-all block">{result.tx_hash}</code>
            <a
              href={`${explorerBase}${result.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View on Explorer <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}