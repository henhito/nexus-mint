import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, Check, AlertCircle, Link as LinkIcon, Unlink, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function WalletLinkSection({ userProfile, onProfileUpdate }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState(null);

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;
  const short = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const isLinked = !!userProfile?.wallet_address;

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.id === "injected") ?? connectors[0];
    if (injectedConnector) connect({ connector: injectedConnector });
  };

  const handleLink = async () => {
    if (!address) return;
    setError(null);
    setLinking(true);
    try {
      let profile;
      if (userProfile?.id) {
        profile = await base44.entities.UserProfile.update(userProfile.id, {
          wallet_address: address,
          wallet_verified: true,
        });
      } else {
        const user = await base44.auth.me();
        profile = await base44.entities.UserProfile.create({
          user_id: user.id,
          wallet_address: address,
          wallet_verified: true,
          minted_count: 0,
        });
      }
      onProfileUpdate?.(profile);
    } catch (e) {
      setError("Failed to link wallet. Please try again.");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!userProfile?.id) return;
    setError(null);
    setLinking(true);
    try {
      const updated = await base44.entities.UserProfile.update(userProfile.id, {
        wallet_address: "",
        wallet_verified: false,
      });
      disconnect();
      onProfileUpdate?.(updated);
    } catch (e) {
      setError("Failed to unlink wallet.");
    } finally {
      setLinking(false);
    }
  };

  if (isLinked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <div className="text-xs text-green-400/80 font-medium">Wallet Linked</div>
            <div className="text-sm text-foreground font-mono">{short(userProfile.wallet_address)}</div>
          </div>
        </div>
        <button
          onClick={handleUnlink}
          disabled={linking}
          className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-red-400 transition-colors"
        >
          <Unlink className="w-3.5 h-3.5" />
          Unlink
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-foreground/50 font-medium">Link Your Wallet</div>

      {!isConnected ? (
        !hasProvider ? (
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-xl h-11 text-sm font-medium transition-colors"
          >
            <Wallet className="w-4 h-4" />
            Install MetaMask to continue
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
        <button
          onClick={handleConnect}
          disabled={isPending}
          className="w-full flex items-center justify-center border border-foreground/[0.1] bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08] rounded-xl h-11 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isPending ? "Connecting..." : "Connect MetaMask"}
        </button>
        )
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/[0.08]">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-foreground font-mono">{short(address)}</span>
          </div>
          <button
            onClick={handleLink}
            disabled={linking}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl h-11 text-sm font-medium transition-all disabled:opacity-50"
          >
            <LinkIcon className="w-4 h-4" />
            {linking ? "Linking..." : "Link This Wallet"}
          </button>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      <p className="text-xs text-foreground/35">
        Your wallet is securely linked server-side. We never ask for signatures or seed phrases.
      </p>
    </div>
  );
}