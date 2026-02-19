import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, CheckCheck, X, CheckCircle2, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const load = async () => {
    if (!userEmail) return;
    const items = await base44.entities.Notification.filter(
      { user_email: userEmail },
      "-created_date",
      20
    );
    setNotifications(items);
  };

  useEffect(() => {
    load();
    // Poll every 15 seconds for new notifications
    const interval = setInterval(load, 15000);
    // Real-time subscription
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email === userEmail) {
        setNotifications((prev) => [event.data, ...prev]);
      } else if (event.type === "update") {
        setNotifications((prev) =>
          prev.map((n) => (n.id === event.id ? event.data : n))
        );
      } else if (event.type === "delete") {
        setNotifications((prev) => prev.filter((n) => n.id !== event.id));
      }
    });
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [userEmail]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) => base44.entities.Notification.update(n.id, { read: true }))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = async (id) => {
    await base44.entities.Notification.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const typeIcon = (type) => {
    if (type === "success") return <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />;
    if (type === "error") return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
    return <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 glass-strong rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-purple-400 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`group flex gap-3 px-4 py-3 border-b border-white/[0.04] transition-colors ${
                      !n.read ? "bg-white/[0.03]" : ""
                    }`}
                  >
                    <div className="mt-0.5">{typeIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-medium leading-snug ${!n.read ? "text-white" : "text-white/60"}`}>
                          {n.title}
                        </p>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-white/30 hover:text-white/70 flex-shrink-0 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-white/35 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-white/20 mt-1">
                        {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}