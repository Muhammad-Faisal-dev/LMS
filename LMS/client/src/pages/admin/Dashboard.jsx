import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import DashboardShell from "../../components/ui/DashboardShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import LoadingState from "../../components/ui/LoadingState.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import BarChartCard from "../../components/charts/BarChartCard.jsx";
import DonutChartCard from "../../components/charts/DonutChartCard.jsx";
import { formatDate, getAudienceLabel } from "../../utils/ui.js";

const adminTabs = [
  { label: "Overview", to: "/admin", active: true },
  { label: "Pending approvals", to: "/admin/pending-approvals" },
  { label: "Manage users", to: "/admin/manage-users" },
  { label: "Manage courses", to: "/admin/manage-courses" },
  { label: "Send message", to: "/admin/send-message" },
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [pendingRes, coursesRes, messagesRes, analyticsRes] = await Promise.all([
        api.get("/users/pending"),
        api.get("/courses"),
        api.get("/messages/admin"),
        api.get("/analytics/overview"),
      ]);

      setPendingUsers(pendingRes.data.data || []);
      setCourses(coursesRes.data.data || []);
      setMessages(messagesRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load the admin overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const stats = useMemo(() => {
    if (!analytics) return [];

    return [
      <StatCard
        key="pending"
        label="Pending approvals"
        value={analytics.pendingUsers}
        hint="New registrations waiting for a decision."
        accent="from-amber-400 to-orange-500"
        icon={<ClockIcon />}
      />,
      <StatCard
        key="courses"
        label="Live courses"
        value={analytics.totalCourses}
        hint="Courses currently available in the platform."
        accent="from-cyan-400 to-sky-500"
        icon={<CourseIcon />}
      />,
      <StatCard
        key="messages"
        label="Announcements"
        value={analytics.totalMessages}
        hint="Messages broadcast across the LMS."
        accent="from-fuchsia-500 to-violet-500"
        icon={<AnnouncementIcon />}
      />,
      <StatCard
        key="submissions"
        label="Graded submissions"
        value={`${analytics.gradedSubmissions}/${analytics.totalSubmissions}`}
        hint="Submission review progress across the platform."
        accent="from-emerald-400 to-teal-500"
        icon={<CheckIcon />}
      />,
    ];
  }, [analytics]);

  if (loading) {
    return <LoadingState label="Loading the admin command center..." />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Admin command center"
      subtitle="Monitor platform health, user growth, academic delivery, and announcements from a more production-level dashboard."
      tabs={adminTabs}
      actions={
        <>
          <Link
            to="/admin/pending-approvals"
            className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-200"
          >
            Review approvals
          </Link>
          <button
            type="button"
            onClick={loadOverview}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Refresh data
          </button>
        </>
      }
      stats={stats}
    >
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {analytics ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <BarChartCard
            title="User distribution"
            subtitle="See how platform access is split across core roles."
            data={[
              { label: "Admins", value: analytics.usersByRole.admin },
              { label: "Teachers", value: analytics.usersByRole.teacher },
              { label: "Students", value: analytics.usersByRole.student },
            ]}
            accent="from-fuchsia-500 to-violet-500"
          />
          <DonutChartCard
            title="Submission review progress"
            subtitle="How much of the submission workload has been graded."
            value={analytics.gradedSubmissions}
            total={analytics.totalSubmissions || 1}
            color="#34d399"
          />
        </div>
      ) : null}

      {analytics ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <BarChartCard
            title="Student cohorts"
            subtitle="A quick view of how students are grouped."
            data={Object.entries(analytics.cohorts || {}).map(([label, value]) => ({ label, value }))}
            accent="from-emerald-400 to-cyan-400"
          />
          <SectionCard
            title="Platform health"
            subtitle="Key academic delivery metrics for the current LMS state."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="Enrollments" value={analytics.totalEnrollments} />
              <MetricCard label="Assignments" value={analytics.totalAssignments} />
              <MetricCard label="Materials" value={analytics.totalMaterials} />
              <MetricCard label="Unread notifications" value={analytics.unreadNotifications} />
            </div>
          </SectionCard>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Approval queue"
          subtitle="Fresh registrations appear here so you can approve, reject, and place people into the right workflow."
          action={
            <Link to="/admin/pending-approvals" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
              View full queue →
            </Link>
          }
        >
          {pendingUsers.length === 0 ? (
            <EmptyState
              title="Nothing is waiting"
              description="You have cleared all pending registrations. New learners and teachers will show up here automatically."
            />
          ) : (
            <div className="space-y-3">
              {pendingUsers.slice(0, 5).map((user) => (
                <div key={user._id} className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <StatusBadge tone={user.role === "student" ? "success" : user.role === "teacher" ? "info" : "danger"}>
                        {user.role}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{user.email}</p>
                  </div>
                  <div className="text-sm text-slate-400">Registered {formatDate(user.registeredOn)}</div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Announcement activity"
          subtitle="Recent messages sent across students and teachers."
          action={
            <Link to="/admin/send-message" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
              Open messaging →
            </Link>
          }
        >
          {messages.length === 0 ? (
            <EmptyState
              title="No announcements sent"
              description="Broadcast updates to students, teachers, or everyone once your platform is ready."
            />
          ) : (
            <div className="space-y-3">
              {messages.slice(0, 5).map((message) => (
                <div key={message._id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-white">{message.title}</h3>
                    <StatusBadge tone="info">{getAudienceLabel(message.targetAudience)}</StatusBadge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-400">{message.content}</p>
                  <div className="mt-3 text-xs text-slate-500">
                    Sent on {formatDate(message.createdAt)} • Read by {message.readBy?.length || 0} users
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Recently created courses" subtitle="A clean snapshot of course distribution and teacher assignments.">
        {courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Once courses are created, you will see instructors, enrollments, and assignment counts here."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <article key={course._id} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{course.code}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{course.title}</h3>
                  </div>
                  <StatusBadge tone="neutral">{course.students?.length || 0} students</StatusBadge>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-400">{course.description}</p>
                <div className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-400">
                  <p>
                    Instructor: <span className="font-medium text-slate-200">{course.instructor?.name || "Unassigned"}</span>
                  </p>
                  <p className="mt-1">
                    Assignments: {course.assignments?.length || 0} • Materials: {course.materials?.length || 0}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
  </div>
);

const ClockIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CourseIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
  </svg>
);

const AnnouncementIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5.882A1 1 0 0112.447 5l7.106 3.553A1 1 0 0120 9.447v5.106a1 1 0 01-.447.894L12.447 18.99A1 1 0 0111 18.106V5.882zM6 10h2a1 1 0 011 1v2a1 1 0 01-1 1H6V10zM6 14l1.5 4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 13l4 4L19 7" />
  </svg>
);

export default AdminDashboard;
