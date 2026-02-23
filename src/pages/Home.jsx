import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { Shield, Zap, CircleDollarSign, Globe, ArrowRight, Lock, Layers, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import HeroOrb from "../components/mint/HeroOrb";
import FeatureCard from "../components/home/FeatureCard";
import RoadmapStep from "../components/home/RoadmapStep";

...

export default function Home() {
  const [authState, setAuthState] = useState("loading"); // loading | unauthenticated | no-wallet | ready
  useEffect(() => {
    const check = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { setAuthState("unauthenticated"); return; }
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const hasWallet = profiles.length > 0 && !!profiles[0].wallet_address;
      setAuthState(hasWallet ? "ready" : "no-wallet");
    };
    check();
  }, []);

  const ctaLabel = authState === "unauthenticated" || authState === "loading"
    ? "Sign In to Mint"
    : authState === "no-wallet"
    ? "Connect Wallet"
    : "Start Minting";

  const handleCta = () => {
    if (authState === "unauthenticated") {
      base44.auth.redirectToLogin(window.location.href);
    }
    // For no-wallet and ready states, Link handles navigation to Mint page
  };

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-purple-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live on Polygon Amoy • OAuth-Only Login
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Mint Your
              <br />
              <span className="gradient-text">Genesis NFT</span>
              <br />
              For Free
            </h1>

            <p className="text-lg text-white/40 leading-relaxed max-w-lg mb-8">
              No gas fees. No crypto wallet required. Sign in with Google or Facebook,
              provide your wallet address, and we sponsor the transaction server-side.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {authState === "unauthenticated" || authState === "loading" ? (
                <Button
                  onClick={handleCta}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 px-8 py-6 text-base rounded-xl"
                >
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Link to={createPageUrl("Mint")}>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 px-8 py-6 text-base rounded-xl">
                    {ctaLabel}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
              <Link to={createPageUrl("Gallery")}>
                <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/[0.06] px-6 py-6 text-base rounded-xl">
                  View Gallery
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm text-white/30">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>1,000+ Minted</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Audited Contract</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HeroOrb />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold text-white mb-3">Why GenesisNFT?</h2>
          <p className="text-white/35 max-w-md mx-auto">
            A secure, gasless NFT minting experience powered by modern Web3 infrastructure.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-3"
            >
              Roadmap
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/35 mb-10"
            >
              Our journey from testnet to a full ecosystem.
            </motion.p>

            <div>
              {roadmap.map((step, i) => (
                <RoadmapStep key={step.phase} step={step} index={i} isLast={i === roadmap.length - 1} />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">Security Architecture</h3>
            <div className="space-y-4">
              {[
                { label: "Authentication", detail: "OAuth 2.0 + PKCE via Google & Microsoft. Zero passwords stored." },
                { label: "Transaction Signing", detail: "Server-side only. Private keys never touch the browser." },
                { label: "Rate Limiting", detail: "Per-user (3/account) + global daily cap (100/day) enforced server-side." },
                { label: "Metadata Storage", detail: "IPFS-pinned for immutability. No centralized single points of failure." },
                { label: "Network Config", detail: "Chain ID & contract addresses stored server-side only. Frontend cannot override." },
                { label: "XSS Hardening", detail: "Strict CSP. No dangerouslySetInnerHTML. No raw HTML rendering." },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-white/35 mt-0.5">{item.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to mint?
          </h2>
          <p className="text-white/35 mb-8 max-w-md mx-auto">
            Sign in, enter your wallet address, and claim your free Genesis NFT in seconds.
          </p>
          <Link to={createPageUrl("Mint")}>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 px-10 py-6 text-base rounded-xl mint-pulse">
              Mint Now — It's Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}