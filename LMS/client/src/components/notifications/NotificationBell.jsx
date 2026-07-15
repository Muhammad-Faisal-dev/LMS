import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { getSocket } from "../../utils/socket";
import { formatDateTime } from "../../utils/ui";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.get("/notifications?limit=6");
      setNotifications(response.data.data || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch {
      // Silent fail in header widget
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const socket = getSocket();
    if (!socket) return undefined;

    const refreshNotifications = () => {
      loadNotifications();
    };

    socket.emit("notifications:join");
    socket.on("notification:new", refreshNotifications);
    socket.on("notification:updated", refreshNotifications);
    socket.on("notifications:refresh", refreshNotifications);

    return () => {
      socket.off("notification:new", refreshNotifications);
      socket.off("notification:updated", refreshNotifications);
      socket.off("notifications:refresh", refreshNotifications);
    };
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      loadNotifications();
    } catch {
      // Silent fail in header widget
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      loadNotifications();
    } catch {
      // Silent fail in header widget
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[360px] rounded-[28px] border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">Notifications</h3>
              <p className="text-xs text-slate-400">Unread: {unreadCount}</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
            >
              Mark all read
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-slate-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`rounded-2xl border p-4 ${
                    notification.isRead
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-cyan-400/30 bg-cyan-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{notification.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{notification.message}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
                    </div>
                    {!notification.isRead ? (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification._id)}
                        className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                      >
                        Read
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Open notification center
          </Link>
        </div>
      ) : null}
    </div>
  );
};

const BellIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default NotificationBell;
