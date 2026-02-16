import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, ExternalLink, Copy, Check } from "lucide-react";

export default function SetupInstructions() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sections = [
    {
      id: "oauth",
      title: "1. Configure OAuth (Google + Facebook)",
      steps: [
        {
          subtitle: "Enable Backend Functions",
          content: "Dashboard → Settings → App Settings → Activate Backend Functions (requires Builder plan)",
        },
        {
          subtitle: "Custom Google OAuth",
          content: "Go to Google Cloud Console, create OAuth 2.0 client",
          code: "https://app.base44.com/api/apps/YOUR_APP_ID/auth/sso/callback",
          codeLabel: "Redirect URI (replace YOUR_APP_ID):",
          extra: "Then: Dashboard → Settings → Authentication → Google → Use custom OAuth → paste Client ID & Secret",
        },
        {
          subtitle: "Enable Facebook Login",
          content: "Dashboard → Settings → Authentication → Enable Facebook toggle → Save",
        },
        {
          subtitle: "Disable Email/Password",
          content: "Dashboard → Settings → Authentication → Toggle OFF Email/Password → Save",
        },
      ],
    },
    {
      id: "rls",
      title: "2. Configure Row Level Security (RLS)",
      steps: [
        {
          subtitle: "MintRequest Entity",
          content: "Dashboard → Security → MintRequest → Create Access Rules:",
          list: ["Create: Logged-in users", "Read: Creator only", "Update: Admin only", "Delete: Admin only"],
        },
        {
          subtitle: "AuditLog Entity",
          content: "Dashboard → Security → AuditLog → Create Access Rules:",
          list: ["Create: No restrictions (backend only)", "Read: Admin only", "Update: Admin only", "Delete: Admin only"],
        },
        {
          subtitle: "Allowlist Entity",
          content: "Dashboard → Security → Allowlist → Create Access Rules:",
          list: ["All actions: Admin only"],
        },
        {
          subtitle: "Run Security Check",
          content: "Dashboard → Security → Start Security Check → Fix all warnings",
        },
      ],
    },
    {
      id: "env",
      title: "3. Set Environment Variables",
      steps: [
        {
          subtitle: "Required Secrets (Dashboard → Settings → Secrets)",
          code: `POLYGON_NETWORK=amoy
CONTRACT_ADDRESS_AMOY=0x...
CONTRACT_ADDRESS_MAINNET=0x...
RELAYER_PRIVATE_KEY=0x...
IPFS_PINATA_API_KEY=...
IPFS_PINATA_SECRET=...`,
          codeLabel: "Add these secrets:",
        },
        {
          subtitle: "Security Notes",
          list: [
            "Never commit private keys to code",
            "Use separate relayer wallet (not your main wallet)",
            "Fund relayer with MATIC (testnet faucet / mainnet purchase)",
            "Monitor relayer balance regularly",
          ],
        },
      ],
    },
    {
      id: "deploy",
      title: "4. Deploy to Polygon Amoy (Testnet)",
      steps: [
        {
          subtitle: "Deploy Smart Contract",
          content: "Use Hardhat/Foundry to deploy NFT contract to Polygon Amoy (chainId: 80002)",
          extra: "Verify on Amoy PolygonScan",
        },
        {
          subtitle: "Set Amoy Contract Address",
          content: "Copy deployed address → Secrets → CONTRACT_ADDRESS_AMOY → paste",
        },
        {
          subtitle: "Fund Relayer",
          content: "Get testnet MATIC from Polygon Faucet",
          link: "https://faucet.polygon.technology/",
        },
        {
          subtitle: "Deploy Backend Function",
          code: "base44 functions deploy",
          codeLabel: "Run in terminal:",
        },
        {
          subtitle: "Test Minting",
          content: "Sign in with Google → Enter wallet → Mint → Verify tx on Amoy explorer",
        },
      ],
    },
    {
      id: "mainnet",
      title: "5. Migrate to Polygon Mainnet",
      steps: [
        {
          subtitle: "Deploy Mainnet Contract",
          content: "Audit contract → Deploy to Polygon mainnet (chainId: 137) → Verify on PolygonScan",
        },
        {
          subtitle: "Update Environment (ONE CHANGE)",
          code: `POLYGON_NETWORK=mainnet
CONTRACT_ADDRESS_MAINNET=0x<your_mainnet_address>`,
          codeLabel: "Update these secrets:",
        },
        {
          subtitle: "Fund Relayer",
          content: "Purchase MATIC and send to relayer wallet for gas",
        },
        {
          subtitle: "Final Test",
          content: "Mint on mainnet → Verify tx on PolygonScan → Check NFT metadata",
        },
      ],
    },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-base font-semibold text-white mb-1">Setup Guide</h3>
      <p className="text-xs text-white/40 mb-6">Step-by-step instructions for OAuth, RLS, and deployment</p>

      <div className="space-y-2">
        {sections.map((section) => {
          const isExpanded = expandedSection === section.id;
          return (
            <div key={section.id} className="border border-white/[0.06] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
              >
                <span className="text-sm font-medium text-white">{section.title}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-white/40" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/40" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      {section.steps.map((step, i) => (
                        <div key={i} className="pl-4 border-l-2 border-purple-500/20">
                          {step.subtitle && (
                            <h4 className="text-xs font-semibold text-purple-300 mb-1.5">{step.subtitle}</h4>
                          )}
                          {step.content && <p className="text-xs text-white/60 mb-2">{step.content}</p>}
                          {step.list && (
                            <ul className="text-xs text-white/50 space-y-1 list-disc list-inside mb-2">
                              {step.list.map((item, j) => (
                                <li key={j}>{item}</li>
                              ))}
                            </ul>
                          )}
                          {step.code && (
                            <div className="mt-2">
                              {step.codeLabel && (
                                <p className="text-xs text-white/40 mb-1">{step.codeLabel}</p>
                              )}
                              <div className="relative group">
                                <pre className="bg-black/30 rounded-lg p-3 text-xs text-purple-200 overflow-x-auto font-mono">
                                  {step.code}
                                </pre>
                                <button
                                  onClick={() => copyToClipboard(step.code, `${section.id}-${i}`)}
                                  className="absolute top-2 right-2 p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  {copiedText === `${section.id}-${i}` ? (
                                    <Check className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-white/40" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                          {step.extra && <p className="text-xs text-white/40 mt-1.5 italic">{step.extra}</p>}
                          {step.link && (
                            <a
                              href={step.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 mt-1.5"
                            >
                              Open Link <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-green-500/5 border border-green-500/10">
        <p className="text-xs text-green-400/90">
          <strong>✅ After setup:</strong> Test OAuth login, verify RLS rules applied, test mint on Amoy, check audit logs,
          monitor relayer balance.
        </p>
      </div>
    </div>
  );
}