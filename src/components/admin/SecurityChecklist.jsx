import React from "react";
import { Shield, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SecurityChecklist() {
  const checks = [
    { label: "OAuth PKCE Flow", status: "active", detail: "Google + Facebook, state & nonce validated" },
    { label: "Email/Password Disabled", status: "active", detail: "OAuth-only authentication enforced" },
    { label: "Row Level Security", status: "warning", detail: "Configure in Dashboard → Security → Access Rules" },
    { label: "Server-side Signing", status: "active", detail: "Private keys in env vars only, never frontend" },
    { label: "Rate Limiting", status: "active", detail: "3/user, 5/IP/day, 100 global/day" },
    { label: "IPFS Metadata", status: "active", detail: "Server-side pinning via backend function" },
    { label: "Network: Amoy Testnet", status: "active", detail: "Chain ID 80002, switch via POLYGON_NETWORK env" },
    { label: "No XSS Vectors", status: "active", detail: "No dangerouslySetInnerHTML, strict CSP recommended" },
    { label: "Audit Logging", status: "active", detail: "All events logged to AuditLog entity" },
    { label: "Backend Functions", status: "warning", detail: "Must be activated in Settings → App Settings" },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-purple-400" />
        Security & Configuration Checklist
      </h3>
      <div className="space-y-2">
        {checks.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            {item.status === "active" ? (
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/90">{item.label}</div>
              <div className="text-xs text-white/40 mt-0.5">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
        <h4 className="text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wider">Deploy Steps</h4>
        <ol className="text-xs text-white/60 space-y-1.5 list-decimal list-inside">
          <li>Enable Backend Functions in Dashboard → Settings</li>
          <li>Configure Custom Google OAuth (see docs)</li>
          <li>Enable Facebook login toggle</li>
          <li>Set RLS rules for MintRequest, AuditLog, Allowlist</li>
          <li>Run Security Check and fix all warnings</li>
          <li>Set environment variables (POLYGON_NETWORK=amoy, contract addresses, keys)</li>
          <li>Deploy backend function: <code className="bg-white/5 px-1 rounded">base44 functions deploy</code></li>
          <li>Test minting on Amoy testnet</li>
          <li>Deploy mainnet contract, then flip POLYGON_NETWORK=mainnet</li>
        </ol>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
        <p className="text-xs text-yellow-400/90">
          <strong>⚠️ Pre-Launch:</strong> Verify all RLS rules, run security check (0 warnings), test OAuth flow with both providers, ensure relayer funded with MATIC.
        </p>
      </div>
    </div>
  );
}