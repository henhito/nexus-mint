import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Hexagon, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import NFTCard from "../components/gallery/NFTCard";

export default function Gallery() {
  const [mints, setMints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const records = await base44.entities.MintRequest.list("-created_date", 100);
      setMints(records);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = mints.filter((m) => {
    const matchesSearch =
      !search ||
      (m.nft_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.wallet_address || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.token_id || "").includes(search);
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Gallery</h1>
        <p className="text-foreground/50">Browse all minted Genesis NFTs.</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-8"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <Input
            placeholder="Search by name, wallet, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-foreground/[0.04] border-foreground/[0.08] text-foreground placeholder:text-foreground/30 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-foreground/[0.04] border-foreground/[0.08] text-foreground rounded-xl">
            <Filter className="w-4 h-4 mr-2 text-foreground/40" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <Skeleton className="aspect-square bg-white/[0.03]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/[0.06]" />
                  <Skeleton className="h-3 w-16 bg-white/[0.04]" />
                </div>
              </div>
            ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Hexagon className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground/50 mb-1">
            {mints.length === 0 ? "No NFTs minted yet" : "No results found"}
          </h3>
          <p className="text-sm text-foreground/40">
            {mints.length === 0 ? "Be the first to mint a Genesis NFT!" : "Try adjusting your search or filters."}
          </p>
        </motion.div>
      ) : (
        <>
          <p className="text-sm text-foreground/40 mb-4">{filtered.length} NFT{filtered.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((mint, i) => (
              <NFTCard key={mint.id} mint={mint} index={i} network={mint.network || "amoy"} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}