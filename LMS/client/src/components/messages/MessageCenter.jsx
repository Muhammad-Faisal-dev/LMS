import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import { countUnreadMessages, formatDateTime, isMessageReadByUser } from "../../utils/ui";
import DashboardShell from "../ui/DashboardShell";
import EmptyState from "../ui/EmptyState";
import LoadingState from "../ui/LoadingState";
import SectionCard from "../ui/SectionCard";
import StatCard from "../ui/StatCard";
import StatusBadge from "../ui/StatusBadge";

const roleTabs = {
  student: [
    { label: "Overview", to: "/student" },
    { label: "My courses", to: "/student/courses" },
    { label: "Messages", to: "/student/messages" },
  ],
  teacher: [
    { label: "Overview", to: "/teacher" },
    { label: "My courses", to: "/teacher/courses" },
    { label: "Messages", to: "/teacher/messages" },
  ],
};

const MessageCenter = ({ role = "student", title, subtitle }) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/messages");
      setMessages(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load your messages right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const unreadCount = useMemo(
    () => countUnreadMessages(messages, user?._id),
    [messages, user?._id]
  );

  const markAsRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`, {});
      await loadMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update message status.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading your inbox..." />;
  }

  return (
    <DashboardShell
      role={role}
      title={title}
      subtitle={subtitle}
      tabs={roleTabs[role].map((tab) => ({
        ...tab,
        active: tab.to.endsWith("messages"),
      }))}
      actions={
        <button
          type="button"
          onClick={loadMessages}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Refresh inbox
        </button>
      }
      stats={[
        <StatCard
          key="messages"
          label="Total messages"
          value={messages.length}
          hint="Announcements from the administration."
          accent="from-cyan-400 to-sky-500"
          icon={<InboxIcon />}
        />,
        <StatCard
          key="unread"
          label="Unread"
          value={unreadCount}
          hint="Stay on top of important updates."
          accent="from-amber-400 to-orange-500"
          icon={<SparkIcon />}
        />,
      ]}
    >
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {messages.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description="Once an administrator sends a message for your audience, it will appear here with read status and timestamps."
        />
      ) : (
        <SectionCard
          title="Inbox"
          subtitle="Unread updates are highlighted so you never miss important academic news."
        >
          <div className="space-y-4">
            {messages.map((message) => {
              const read = isMessageReadByUser(message, user?._id);

              return (
                <article
                  key={message._id}
                  className={`rounded-[26px] border p-5 transition ${
                    read
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-cyan-400/30 bg-cyan-500/10 shadow-lg shadow-cyan-500/5"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{message.title}</h3>
                        <StatusBadge tone={read ? "neutral" : "info"}>
                          {read ? "Read" : "New"}
                        </StatusBadge>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{message.content}</p>
                    </div>
                    <div className="text-sm text-slate-400">
                      {formatDateTime(message.createdAt)}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-400">
                      From <span className="font-medium text-slate-200">{message.sender?.name || "Admin"}</span>
                    </p>
                    {!read ? (
                      <button
                        type="button"
                        onClick={() => markAsRead(message._id)}
                        className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                      >
                        Mark as read
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </SectionCard>
      )}
    </DashboardShell>
  );
};

const InboxIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 10H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" />
  </svg>
);

const SparkIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3l1.9 5.9H20l-4.8 3.5 1.8 5.8-5-3.6-5 3.6 1.8-5.8L4 8.9h6.1L12 3z" />
  </svg>
);

export default MessageCenter;
