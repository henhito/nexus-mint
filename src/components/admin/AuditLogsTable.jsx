import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function AuditLogsTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const auditLogs = await base44.entities.AuditLog.list("-created_date", 50);
        setLogs(auditLogs);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "error":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <Card className="glass border-foreground/[0.06] overflow-hidden">
      <CardHeader className="border-b border-foreground/[0.06] p-5">
        <CardTitle className="text-base font-semibold text-foreground">Audit Logs</CardTitle>
        <p className="text-xs text-foreground/40 mt-1">Last 50 system events</p>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-foreground/[0.06]">
              <TableHead className="text-foreground/40">Timestamp</TableHead>
              <TableHead className="text-foreground/40">Event Type</TableHead>
              <TableHead className="text-foreground/40">User ID</TableHead>
              <TableHead className="text-foreground/40">IP Address</TableHead>
              <TableHead className="text-foreground/40">Severity</TableHead>
              <TableHead className="text-foreground/40">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32 bg-foreground/[0.04]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-foreground/[0.04]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-foreground/[0.04]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-foreground/[0.04]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 bg-foreground/[0.04]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-foreground/[0.04]" /></TableCell>
                  </TableRow>
                ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-foreground/30 py-8">
                  No audit logs yet
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-foreground/[0.04] hover:bg-foreground/[0.02]">
                  <TableCell className="text-xs text-foreground/50 font-mono">
                    {log.created_date ? format(new Date(log.created_date), "MMM d, HH:mm:ss") : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/70 font-medium">
                    {log.event_type?.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="text-xs text-foreground/50 font-mono">
                    {log.user_id ? log.user_id.slice(0, 8) + "..." : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-foreground/50 font-mono">{log.ip_address || "—"}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] flex items-center gap-1 w-fit ${getSeverityColor(log.severity)}`}>
                      {getSeverityIcon(log.severity)}
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-foreground/40 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details).slice(0, 50) + "..." : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}