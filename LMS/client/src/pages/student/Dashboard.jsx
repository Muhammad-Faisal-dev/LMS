import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import DashboardShell from "../../components/ui/DashboardShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import LoadingState from "../../components/ui/LoadingState.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import DonutChartCard from "../../components/charts/DonutChartCard.jsx";
import { countUnreadMessages } from "../../utils/ui.js";
import { createProgressMap, getCourseProgress } from "../../utils/progress.js";

const studentTabs = [
  { label: "Overview", to: "/student", active: true },
  { label: "My courses", to: "/student/courses" },
  { label: "Messages", to: "/student/messages" },
];

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [coursesRes, messagesRes, analyticsRes, progressRes] = await Promise.all([
        api.get("/courses"),
        api.get("/messages"),
        api.get("/analytics/overview"),
        api.get("/progress/my"),
      ]);
      setCourses(coursesRes.data.data || []);
      setMessages(messagesRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
      setProgressMap(createProgressMap(progressRes.data.data || []));
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load your student dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const progressSummary = useMemo(() => {
    const summary = courses.reduce(
      (accumulator, course) => {
        const progress = getCourseProgress(progressMap, course);
        return {
          completed: accumulator.completed + progress.completed,
          total: accumulator.total + progress.total,
        };
      },
      { completed: 0, total: 0 }
    );

    const percentage = summary.total
      ? Math.round((summary.completed / summary.total) * 100)
      : 0;

    return { ...summary, percentage };
  }, [courses, progressMap]);

  const unreadMessages = useMemo(
    () => countUnreadMessages(messages, user?._id),
    [messages, user?._id]
  );

  const upcomingAssignments = useMemo(
    () =>
      courses
        .flatMap((course) =>
          (course.assignments || []).map((assignment) => ({
            ...assignment,
            courseTitle: course.title,
            courseCode: course.code,
          }))
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 4),
    [courses]
  );

  if (loading) {
    return <LoadingState label="Loading your student dashboard..." />;
  }

  return (
    <DashboardShell
      role="student"
      title={`Welcome back, ${user?.name || "Student"}`}
      subtitle="Stay focused on your enrolled courses, database-synced progress, submissions, and upcoming deadlines from a polished student dashboard."
      tabs={studentTabs}
      actions={
        <>
          <Link to="/student/courses" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200">
            Open my courses
          </Link>
          <button onClick={loadDashboard} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
            Refresh dashboard
          </button>
        </>
      }
      stats={[
        <StatCard key="courses" label="Enrolled courses" value={analytics?.totalCourses ?? courses.length} hint="Everything you are currently studying." accent="from-emerald-400 to-teal-500" icon={<CourseIcon />} />,
        <StatCard key="progress" label="Material progress" value={`${progressSummary.percentage}%`} hint={`${progressSummary.completed}/${progressSummary.total} learning materials completed.`} accent="from-cyan-400 to-sky-500" icon={<ProgressIcon />} />,
        <StatCard key="submitted" label="Submitted / graded" value={`${analytics?.submittedAssignments ?? 0}/${analytics?.gradedAssignments ?? 0}`} hint="Track your assignment workflow." accent="from-fuchsia-500 to-violet-500" icon={<CheckIcon />} />,
        <StatCard key="messages" label="Unread messages" value={unreadMessages} hint="Administrative updates that still need your attention." accent="from-amber-400 to-orange-500" icon={<InboxIcon />} />,
      ]}
    >
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DonutChartCard
          title="Overall material completion"
          subtitle="Your course materials completed across the LMS database."
          value={progressSummary.completed}
          total={progressSummary.total || 1}
          color="#34d399"
        />

        <SectionCard title="Upcoming assignments" subtitle="Closest deadlines across all enrolled courses.">
          {upcomingAssignments.length === 0 ? (
            <EmptyState
              title="No assignments posted"
              description="Teachers have not published assignment deadlines for your courses yet."
            />
          ) : (
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <article key={assignment._id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-white">{assignment.title}</h3>
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{assignment.courseTitle} • {assignment.courseCode}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{assignment.description || "No assignment description provided yet."}</p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </DashboardShell>
  );
};

const CourseIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
  </svg>
);

const ProgressIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 20V10m0 0l-4 4m4-4l4 4M5 4h14" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 13l4 4L19 7" />
  </svg>
);

const InboxIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 10H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" />
  </svg>
);

export default StudentDashboard;
