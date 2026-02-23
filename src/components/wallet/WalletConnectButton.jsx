import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, LogOut, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletConnectButton({ onAddressChange }) {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onAddressChange?.(accounts[0]);
        }
      });

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onAddressChange?.(accounts[0]);
        } else {
          setAccount(null);
          onAddressChange?.("");
        }
      });
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install it from metamask.io");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      onAddressChange?.(accounts[0]);
    } catch (err) {
      setError(err.code === 4001 ? "Connection rejected." : "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    onAddressChange?.("");
    setShowDropdown(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (account) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white hover:bg-white/[0.09] transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-green-400" />
          {shortAddress(account)}
          <ChevronDown className="w-3 h-3 text-white/40" />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-2 w-52 rounded-xl bg-[#111] border border-white/[0.08] shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-xs text-white/40 mb-1">Connected wallet</p>
                <p className="text-sm text-white font-mono truncate">{shortAddress(account)}</p>
              </div>
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy address"}
              </button>
              <button
                onClick={disconnect}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
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

  return (
    <div>
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-sm rounded-xl"
        variant="ghost"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}