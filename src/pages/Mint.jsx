import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Hash, Sparkles, AlertTriangle, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HeroOrb from "../components/mint/HeroOrb";
import StatBadge from "../components/mint/StatBadge";
import MintButton from "../components/mint/MintButton";
import MintResult from "../components/mint/MintResult";
import WalletConnectButton from "../components/wallet/WalletConnectButton";

const MAX_MINTS_PER_USER = 3;

export default function Mint() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);
  const [error, setError] = useState(null);
  const [userMints, setUserMints] = useState([]);
  const [totalMinted, setTotalMinted] = useState(0);

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
      if (authed) {
        const u = await base44.auth.me();
        setUser(u);
        // Load user's mint history
        const mints = await base44.entities.MintRequest.filter({ created_by: u.email });
        setUserMints(mints);
      }
      // Load total minted count
      const allMints = await base44.entities.MintRequest.filter({ status: "confirmed" });
      setTotalMinted(allMints.length);
      setLoading(false);
    };
    init();
  }, []);

  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleMint = async () => {
    setError(null);
    setMintResult(null);

    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (!isValidAddress(walletAddress)) {
      setError("Please enter a valid Ethereum/Polygon wallet address (0x...)");
      return;
    }

    if (userMints.length >= MAX_MINTS_PER_USER) {
      setError(`You've already used all ${MAX_MINTS_PER_USER} of your free mints.`);
      return;
    }

    setIsMinting(true);

    try {
      // Call backend function for gasless minting
      const response = await base44.functions.invoke("mintNft", {
        walletAddress: walletAddress,
      });

      if (response.success) {
        const mintData = response.mint;
        
        // Refresh user mints
        const updatedMints = await base44.entities.MintRequest.filter({ created_by: user.email });
        setUserMints(updatedMints);
        setTotalMinted((prev) => prev + 1);

        // Set result for display
        setMintResult({
          tx_hash: mintData.txHash,
          token_id: mintData.tokenId,
          nft_name: mintData.nftName,
          image_url: mintData.imageUrl,
          network: mintData.network,
        });
      } else {
        setError(response.error || "Mint failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to mint NFT. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const mintCount = userMints.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Free Mint</h1>
        <p className="text-white/40 max-w-md mx-auto">
          Connect your account, enter your wallet address, and claim your Genesis NFT.
          We cover all gas fees.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        <StatBadge label="Total Minted" value={totalMinted.toLocaleString()} icon={Hash} />
        <StatBadge label="Your Mints" value={`${mintCount} / ${MAX_MINTS_PER_USER}`} icon={Wallet} />
        <StatBadge label="Network" value="Amoy" icon={Shield} />
      </motion.div>

      {/* Mint Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-3xl p-6 sm:p-10 max-w-xl mx-auto"
      >
        {!isAuthenticated ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sign In Required</h3>
            <p className="text-sm text-white/40 mb-6">
              Connect with Google or Facebook to start minting. OAuth-only, no passwords stored.
            </p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 px-8 py-3 rounded-xl"
            >
              Sign In to Mint
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* User info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white">
                {(user?.full_name || user?.email || "U")[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{user?.full_name || "User"}</div>
                <div className="text-xs text-white/30">{user?.email}</div>
              </div>
            </div>

            {/* Wallet input */}
            <div className="space-y-2">
              <Label className="text-sm text-white/50">Wallet Address</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-purple-500/30 rounded-xl h-12"
                />
              </div>
              <p className="text-xs text-white/25">
                Your Polygon-compatible wallet address. NFT will be sent here.
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mint button */}
            <MintButton
              onClick={handleMint}
              isMinting={isMinting}
              disabled={mintCount >= MAX_MINTS_PER_USER || !walletAddress}
              mintCount={mintCount}
              maxMints={MAX_MINTS_PER_USER}
            />
          </div>
        )}
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {mintResult && (
          <MintResult result={mintResult} network="amoy" />
        )}
      </AnimatePresence>

      {/* Security note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-xs text-white/20 max-w-md mx-auto leading-relaxed">
          <Shield className="w-3 h-3 inline-block mr-1 -mt-0.5" />
          Transactions are signed server-side. Your private keys are never exposed.
          OAuth 2.0 with PKCE ensures secure authentication.
        </p>
      </motion.div>
    </div>
  );
}