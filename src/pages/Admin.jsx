import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Hash, Users, Activity, Settings, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import SecurityChecklist from "../components/admin/SecurityChecklist";
import SetupInstructions from "../components/admin/SetupInstructions";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mints, setMints] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, failed: 0, uniqueWallets: 0 });

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        setLoading(false);
        return;
      }
      const u = await base44.auth.me();
      setUser(u);
      setIsAdmin(u.role === "admin");

      if (u.role === "admin") {
        const records = await base44.entities.MintRequest.list("-created_date", 200);
        setMints(records);

        const wallets = new Set(records.map((r) => r.wallet_address));
        setStats({
          total: records.length,
          confirmed: records.filter((r) => r.status === "confirmed").length,
          pending: records.filter((r) => r.status === "pending").length,
          failed: records.filter((r) => r.status === "failed").length,
          uniqueWallets: wallets.size,
        });
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (id) => {
    await base44.entities.MintRequest.delete(id);
    setMints((prev) => prev.filter((m) => m.id !== id));
    setStats((prev) => ({ ...prev, total: prev.total - 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-sm text-white/40">You need admin privileges to view this page.</p>
      </div>
    );
  }

  const statCards = [
    { title: "Total Mints", value: stats.total, icon: Hash, color: "text-purple-400" },
    { title: "Confirmed", value: stats.confirmed, icon: Activity, color: "text-green-400" },
    { title: "Pending", value: stats.pending, icon: Settings, color: "text-yellow-400" },
    { title: "Unique Wallets", value: stats.uniqueWallets, icon: Users, color: "text-cyan-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <p className="text-white/40 text-sm">Monitor mints, manage records, and view analytics.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass border-white/[0.06]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/35 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs: Overview, Setup, Audit Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/[0.04]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <SecurityChecklist />
          </TabsContent>

          <TabsContent value="setup" className="mt-6">
            <SetupInstructions />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditLogsTable />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Mint records table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass border-white/[0.06] overflow-hidden">
          <CardHeader className="border-b border-white/[0.06] p-5">
            <CardTitle className="text-base font-semibold text-white">Mint Records</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06]">
                  <TableHead className="text-white/40">NFT</TableHead>
                  <TableHead className="text-white/40">Wallet</TableHead>
                  <TableHead className="text-white/40">Token ID</TableHead>
                  <TableHead className="text-white/40">Status</TableHead>
                  <TableHead className="text-white/40">Date</TableHead>
                  <TableHead className="text-white/40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-white/30 py-8">
                      No mint records yet
                    </TableCell>
                  </TableRow>
                ) : (
                  mints.map((mint) => (
                    <TableRow key={mint.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                      <TableCell className="text-sm text-white font-medium">
                        {mint.nft_name || `#${mint.token_id}`}
                      </TableCell>
                      <TableCell className="text-xs text-white/50 font-mono">
                        {mint.wallet_address
                          ? `${mint.wallet_address.slice(0, 6)}...${mint.wallet_address.slice(-4)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-white/60">#{mint.token_id || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] ${
                            mint.status === "confirmed"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : mint.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {mint.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-white/40">
                        {mint.created_date ? format(new Date(mint.created_date), "MMM d, HH:mm") : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(mint.id)}
                          className="text-white/30 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}