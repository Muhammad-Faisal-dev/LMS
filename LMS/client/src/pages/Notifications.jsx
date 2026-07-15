import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import api from "../utils/api";
import { getSocket } from "../utils/socket";
import DashboardShell from "../components/ui/DashboardShell.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { formatDateTime } from "../utils/ui.js";

const Notifications = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tabs = useMemo(() => {
    const base =
      user?.role === "admin"
        ? "/admin"
        : user?.role === "teacher"
        ? "/teacher"
        : "/student";

    return [
      { label: "Overview", to: base },
      { label: "Notifications", to: "/notifications", active: true },
    ];
  }, [user?.role]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/notifications?limit=100");
      setNotifications(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load notifications.");
    } finally {
      setLoading(false);
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

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      loadNotifications();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update notification.");
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      loadNotifications();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update notifications.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading notification center..." />;
  }

  return (
    <DashboardShell
      role={user?.role || "student"}
      title="Notification center"
      subtitle="Track approvals, enrollments, assignments, grades, and system updates from one place with live Socket.IO delivery."
      tabs={tabs}
      actions={
        <button
          type="button"
          onClick={markAllRead}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Mark all read
        </button>
      }
      stats={[
        <StatCard key="total" label="Total notifications" value={notifications.length} hint="Your full activity stream in the LMS." accent="from-cyan-400 to-sky-500" icon={<BellIcon />} />,
        <StatCard key="unread" label="Unread" value={unreadCount} hint="Items that still need your attention." accent="from-amber-400 to-orange-500" icon={<SparkIcon />} />,
      ]}
    >
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <SectionCard title="Latest activity" subtitle="New updates arrive in real time and stay highlighted until you mark them as read.">
        {notifications.length === 0 ? (
          <EmptyState title="No notifications yet" description="When something important happens in the LMS, you will see it here instantly." />
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`rounded-[26px] border p-5 ${
                  notification.isRead
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-cyan-400/30 bg-cyan-500/10"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                      <StatusBadge tone={notification.isRead ? "neutral" : "info"}>
                        {notification.isRead ? "Read" : "Unread"}
                      </StatusBadge>
                      <StatusBadge tone="neutral">{notification.type}</StatusBadge>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{notification.message}</p>
                    <p className="mt-3 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
                  </div>
                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification._id)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
};

const BellIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SparkIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3l1.9 5.9H20l-4.8 3.5 1.8 5.8-5-3.6-5 3.6 1.8-5.8L4 8.9h6.1L12 3z" />
  </svg>
);

export default Notifications;
