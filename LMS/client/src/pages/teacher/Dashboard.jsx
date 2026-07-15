import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import DashboardShell from "../../components/ui/DashboardShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import LoadingState from "../../components/ui/LoadingState.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import BarChartCard from "../../components/charts/BarChartCard.jsx";

const teacherTabs = [
  { label: "Overview", to: "/teacher", active: true },
  { label: "My courses", to: "/teacher/courses" },
  { label: "Messages", to: "/teacher/messages" },
];

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [coursesRes, analyticsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/analytics/overview"),
      ]);
      setCourses(coursesRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load your teacher dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    if (!analytics) return [];
    return [
      <StatCard key="courses" label="Teaching courses" value={analytics.totalCourses} hint="Courses assigned to your teaching workspace." accent="from-sky-400 to-cyan-500" icon={<CourseIcon />} />,
      <StatCard key="students" label="Enrolled students" value={analytics.totalStudents} hint="Total learners across your classes." accent="from-emerald-400 to-teal-500" icon={<PeopleIcon />} />,
      <StatCard key="content" label="Materials / Assignments" value={`${analytics.totalMaterials} / ${analytics.totalAssignments}`} hint="Published learning content and task count." accent="from-fuchsia-500 to-violet-500" icon={<FolderIcon />} />,
      <StatCard key="submissions" label="Graded submissions" value={`${analytics.gradedSubmissions}/${analytics.totalSubmissions}`} hint="Review progress for student work." accent="from-amber-400 to-orange-500" icon={<InboxIcon />} />,
    ];
  }, [analytics]);

  if (loading) {
    return <LoadingState label="Loading your teacher dashboard..." />;
  }

  return (
    <DashboardShell
      role="teacher"
      title={`Welcome back, ${user?.name || "Teacher"}`}
      subtitle="Manage course delivery, publish materials and assignments, and review engagement with cleaner teaching analytics."
      tabs={teacherTabs}
      actions={
        <>
          <Link to="/teacher/courses" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200">
            Manage my courses
          </Link>
          <button onClick={loadDashboard} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
            Refresh analytics
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

      {analytics?.courses?.length ? (
        <BarChartCard
          title="Enrollment by course"
          subtitle="Track class sizes at a glance so you know where the teaching load is concentrated."
          data={analytics.courses.map((course) => ({ label: course.code, value: course.students }))}
          accent="from-sky-400 to-cyan-500"
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <SectionCard title="Your courses" subtitle="A high-level view of the classes you are responsible for teaching.">
          {courses.length === 0 ? (
            <EmptyState
              title="No courses assigned yet"
              description="Once an administrator assigns you to a course, it will appear here with students, materials, and assignments."
            />
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 4).map((course) => (
                <article key={course._id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{course.code}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{course.title}</h3>
                    </div>
                    <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-200">
                      {course.students?.length || 0} students
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{course.description}</p>
                  <div className="mt-4 text-sm text-slate-500">
                    Materials: {course.materials?.length || 0} • Assignments: {course.assignments?.length || 0}
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Teaching priorities" subtitle="Stay focused on the next actions that improve classroom readiness.">
          <div className="space-y-4">
            {[
              "Publish fresh learning materials for each active course.",
              "Add assignment deadlines so students know what is due next.",
              "Grade pending submissions to keep feedback loops strong.",
            ].map((task) => (
              <div key={task} className="flex gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm leading-7 text-slate-300">{task}</p>
              </div>
            ))}
          </div>
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

const PeopleIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0a5 5 0 00-10 0M15 7a3 3 0 11-6 0 3 3 0 016 0" />
  </svg>
);

const FolderIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
);

const InboxIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 10H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" />
  </svg>
);

export default TeacherDashboard;
