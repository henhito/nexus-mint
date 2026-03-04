import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, ChevronDown, LogOut, Copy, Check, AlertCircle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletConnectButton({ onAddressChange }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  // Notify parent of address changes
  React.useEffect(() => {
    onAddressChange?.(isConnected ? address : "");
  }, [address, isConnected]);

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.id === "injected") ?? connectors[0];
    if (injectedConnector) connect({ connector: injectedConnector });
  };

  const handleDisconnect = () => {
    disconnect();
    onAddressChange?.("");
    setShowDropdown(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const short = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground/[0.06] border border-foreground/[0.08] text-sm text-foreground hover:bg-foreground/[0.09] transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          {short(address)}
          <ChevronDown className="w-3 h-3 text-foreground/40" />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-2 w-52 rounded-xl bg-background border border-foreground/[0.08] shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-foreground/[0.06]">
                <p className="text-xs text-foreground/40 mb-1">Connected wallet</p>
                <p className="text-sm text-foreground font-mono">{short(address)}</p>
              </div>
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy address"}
              </button>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-foreground/[0.04] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!hasProvider) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 text-sm rounded-xl transition-colors"
      >
        <Wallet className="w-4 h-4" />
        Install MetaMask
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleConnect}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 bg-foreground/[0.08] hover:bg-foreground/[0.12] border border-foreground/[0.12] text-foreground text-sm rounded-xl transition-colors disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="w-3 h-3" />
          {error.shortMessage || "Connection failed"}
        </p>
      )}
    </div>
  );
}