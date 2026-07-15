import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import DashboardShell from "../../components/ui/DashboardShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import LoadingState from "../../components/ui/LoadingState.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { formatDateTime, getAudienceLabel } from "../../utils/ui.js";

const adminTabs = [
  { label: "Overview", to: "/admin" },
  { label: "Pending approvals", to: "/admin/pending-approvals" },
  { label: "Manage users", to: "/admin/manage-users" },
  { label: "Manage courses", to: "/admin/manage-courses" },
  { label: "Send message", to: "/admin/send-message", active: true },
];

const initialForm = {
  title: "",
  content: "",
  targetAudience: "both",
};

const SendMessage = () => {
  const [formData, setFormData] = useState(initialForm);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/messages/admin");
      setMessages(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load message history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const stats = useMemo(() => {
    const forStudents = messages.filter((message) => ["students", "both"].includes(message.targetAudience)).length;
    const forTeachers = messages.filter((message) => ["teachers", "both"].includes(message.targetAudience)).length;

    return [
      <StatCard key="sent" label="Messages sent" value={messages.length} hint="Your complete announcement history." accent="from-cyan-400 to-sky-500" icon={<InboxIcon />} />,
      <StatCard key="students" label="Student-facing" value={forStudents} hint="Announcements visible to students." accent="from-emerald-400 to-teal-500" icon={<StudentIcon />} />,
      <StatCard key="teachers" label="Teacher-facing" value={forTeachers} hint="Announcements visible to teachers." accent="from-fuchsia-500 to-violet-500" icon={<TeacherIcon />} />,
    ];
  }, [messages]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.post("/messages", formData);
      setFormData(initialForm);
      setSuccess("Announcement sent successfully.");
      await loadMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMessage = async (id) => {
    const confirmed = window.confirm("Delete this announcement?");
    if (!confirmed) return;

    try {
      await api.delete(`/messages/${id}`);
      await loadMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete message.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading announcement studio..." />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Messaging studio"
      subtitle="Broadcast polished announcements to students, teachers, or everyone—and monitor what has already been sent."
      tabs={adminTabs}
      actions={
        <button
          type="button"
          onClick={loadMessages}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Refresh history
        </button>
      }
      stats={stats}
    >
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Compose announcement" subtitle="Write a message that feels clear, direct, and useful for your audience.">
          <form onSubmit={sendMessage} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Title</span>
              <input
                name="title"
                value={formData.title}
                onChange={onChange}
                placeholder="Midterm schedule update"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Content</span>
              <textarea
                name="content"
                value={formData.content}
                onChange={onChange}
                rows="8"
                placeholder="Share the update, deadline, or reminder..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                required
              />
            </label>

            <div>
              <span className="mb-3 block text-sm font-medium text-slate-200">Target audience</span>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Everyone", value: "both" },
                  { label: "Students", value: "students" },
                  { label: "Teachers", value: "teachers" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm transition ${
                      formData.targetAudience === option.value
                        ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetAudience"
                      value={option.value}
                      checked={formData.targetAudience === option.value}
                      onChange={onChange}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-70"
              >
                {submitting ? "Sending..." : "Send announcement"}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Live preview" subtitle="This is how your message will appear inside the LMS inbox.">
          <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{formData.title || "Your announcement title"}</h3>
              <StatusBadge tone="info">{getAudienceLabel(formData.targetAudience)}</StatusBadge>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-cyan-50/90">
              {formData.content || "Your message preview will appear here as you type."}
            </p>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs uppercase tracking-[0.2em] text-cyan-100/70">
              Sent by admin • Visible in the LMS inbox
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Sent announcements" subtitle="Review recently sent updates and remove outdated messages if needed.">
        {messages.length === 0 ? (
          <EmptyState
            title="No announcements yet"
            description="Your message history will appear here after you send your first announcement."
          />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <article key={message._id} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{message.title}</h3>
                      <StatusBadge tone="info">{getAudienceLabel(message.targetAudience)}</StatusBadge>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{message.content}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      Sent {formatDateTime(message.createdAt)} • Read by {message.readBy?.length || 0} users
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMessage(message._id)}
                    className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
};

const InboxIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 10H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" />
  </svg>
);

const StudentIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
  </svg>
);

const TeacherIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0a5 5 0 00-10 0M15 7a3 3 0 11-6 0 3 3 0 016 0" />
  </svg>
);

export default SendMessage;
