import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Sparkles, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StatBadge from "../components/mint/StatBadge";
import MintButton from "../components/mint/MintButton";
import MintResult from "../components/mint/MintResult";
import WalletLinkSection from "../components/mint/WalletLinkSection";
import MintProgress from "../components/mint/MintProgress";
import NFTPreviewCard from "../components/mint/NFTPreviewCard";

const MAX_MINTS = 3;

export default function Mint() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState(-1);
  const [mintResult, setMintResult] = useState(null);
  const [error, setError] = useState(null);
  const [mintCount, setMintCount] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
      if (authed) {
        const u = await base44.auth.me();
        setUser(u);
        // Load user profile
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
        if (profiles.length > 0) setUserProfile(profiles[0]);
        // Load user mint count
        const mints = await base44.entities.MintRequest.filter({ user_id: u.id, status: { $in: ["pending", "confirmed"] } });
        setMintCount(mints.length);
      }
      const allMinted = await base44.entities.MintRequest.filter({ status: "confirmed" });
      setTotalMinted(allMinted.length);
      setLoading(false);
    };
    init();
  }, []);

  const walletLinked = !!userProfile?.wallet_address;

  const handleMint = async () => {
    setError(null);
    setMintResult(null);
    setIsMinting(true);

    // Simulate step progression
    let step = 0;
    setMintStep(0);
    const stepInterval = setInterval(() => {
      step += 1;
      if (step < 4) setMintStep(step);
    }, 1200);

    try {
      const { data } = await base44.functions.invoke("mintNFT", {});
      clearInterval(stepInterval);
      if (data.success) {
        setMintStep(5); // all done
        setMintResult(data.mint);
        setMintCount((c) => c + 1);
        setTotalMinted((c) => c + 1);
      } else {
        setMintStep(-1);
        setError(data.error || "Mint failed. Please try again.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      setMintStep(-1);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Free Mint</h1>
        <p className="text-foreground/50 max-w-md mx-auto">
          Sign in, link your wallet, and claim your Genesis NFT. We cover all gas fees.
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
        <StatBadge label="Your Mints" value={`${mintCount} / ${MAX_MINTS}`} icon={Sparkles} />
        <StatBadge label="Network" value="Amoy" icon={Shield} />
      </motion.div>

      {/* Main content: NFT preview + Mint Card */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-3xl mx-auto">
        {/* NFT Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-72 flex-shrink-0"
        >
          <NFTPreviewCard
            imageUrl={mintResult?.image_url}
            name={mintResult?.nft_name}
            tokenId={mintResult?.token_id}
            isMinting={isMinting}
          />
        </motion.div>

        {/* Mint Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-strong rounded-3xl p-6 sm:p-8 flex-1 w-full"
        >
          {/* Not authenticated */}
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Sign In Required</h3>
              <p className="text-sm text-foreground/50 mb-6">
                Connect with Google or Facebook to start minting. OAuth-only — no passwords stored.
              </p>
              <Button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 px-8 py-3 rounded-xl"
              >
                Sign In to Mint
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* User info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white">
                  {(user?.full_name || user?.email || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{user?.full_name || "User"}</div>
                  <div className="text-xs text-foreground/40">{user?.email}</div>
                </div>
              </div>

              {/* Wallet Link */}
              <WalletLinkSection userProfile={userProfile} onProfileUpdate={setUserProfile} />

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress during minting */}
              <AnimatePresence>
                {isMinting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <MintProgress currentStep={mintStep} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success result inline */}
              <AnimatePresence>
                {mintResult && !isMinting && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                      <Sparkles className="w-4 h-4" />
                      NFT Minted Successfully!
                    </div>
                    {mintResult.nft_name && (
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground/50">Name</span>
                        <span className="text-foreground font-medium">{mintResult.nft_name}</span>
                      </div>
                    )}
                    {mintResult.token_id && (
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground/50">Token ID</span>
                        <span className="text-foreground font-mono">#{mintResult.token_id}</span>
                      </div>
                    )}
                    {mintResult.tx_hash && (
                      <a
                        href={`https://amoy.polygonscan.com/tx/${mintResult.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors pt-1 font-medium"
                      >
                        View on Polygonscan
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mint button — disabled if wallet not linked or minting */}
              {!walletLinked ? (
                <div className="text-center py-2">
                  <p className="text-sm text-foreground/40">Link your wallet above to enable minting.</p>
                </div>
              ) : (
                <MintButton
                  onClick={handleMint}
                  isMinting={isMinting}
                  disabled={mintCount >= MAX_MINTS}
                  mintCount={mintCount}
                  maxMints={MAX_MINTS}
                />
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Security note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 text-center">
        <p className="text-xs text-foreground/35 max-w-md mx-auto leading-relaxed">
          <Shield className="w-3 h-3 inline-block mr-1 -mt-0.5" />
          Transactions are signed server-side. Your private keys are never exposed.
          OAuth 2.0 with PKCE ensures secure authentication.
        </p>
      </motion.div>
    </div>
  );
}