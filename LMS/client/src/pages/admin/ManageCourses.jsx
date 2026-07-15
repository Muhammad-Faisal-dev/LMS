import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import DashboardShell from "../../components/ui/DashboardShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import LoadingState from "../../components/ui/LoadingState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";

const adminTabs = [
  { label: "Overview", to: "/admin" },
  { label: "Pending approvals", to: "/admin/pending-approvals" },
  { label: "Manage users", to: "/admin/manage-users" },
  { label: "Manage courses", to: "/admin/manage-courses", active: true },
  { label: "Send message", to: "/admin/send-message" },
];

const emptyCourse = {
  title: "",
  code: "",
  description: "",
  instructor: "",
};

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [formData, setFormData] = useState(emptyCourse);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [coursesRes, teachersRes, studentsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/users?role=teacher&approved=true"),
        api.get("/users?role=student&approved=true"),
      ]);

      setCourses(coursesRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
      setStudents(studentsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load course management data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableCohorts = useMemo(
    () => Array.from(new Set(students.map((student) => student.cohort).filter(Boolean))),
    [students]
  );

  const filteredCourses = useMemo(() => {
    const term = query.toLowerCase();
    return courses.filter((course) =>
      [course.title, course.code, course.description, course.instructor?.name]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [courses, query]);

  const stats = useMemo(() => {
    const enrolledStudents = courses.reduce((sum, course) => sum + (course.students?.length || 0), 0);
    const materials = courses.reduce((sum, course) => sum + (course.materials?.length || 0), 0);

    return [
      <StatCard key="courses" label="Courses" value={courses.length} hint="All live courses managed by the platform." accent="from-cyan-400 to-sky-500" icon={<CourseIcon />} />,
      <StatCard key="teachers" label="Approved teachers" value={teachers.length} hint="Teachers available for new course assignments." accent="from-fuchsia-500 to-violet-500" icon={<TeacherIcon />} />,
      <StatCard key="students" label="Enrollments" value={enrolledStudents} hint="Total student-course enrollments across the LMS." accent="from-emerald-400 to-teal-500" icon={<PeopleIcon />} />,
      <StatCard key="materials" label="Materials" value={materials} hint="Content uploaded across all courses." accent="from-amber-400 to-orange-500" icon={<FolderIcon />} />,
    ];
  }, [courses, teachers.length]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createCourse = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await api.post("/courses", {
        ...formData,
        code: formData.code.trim().toUpperCase(),
      });
      setFormData(emptyCourse);
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to create course.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCourse = async (id) => {
    const confirmed = window.confirm("Delete this course permanently?");
    if (!confirmed) return;

    try {
      await api.delete(`/courses/${id}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete course.");
    }
  };

  const openAssignModal = (course) => {
    setSelectedCourse(course);
    setSelectedCohort(availableCohorts[0] || "");
    setShowAssignModal(true);
  };

  const assignCohort = async () => {
    if (!selectedCourse || !selectedCohort) return;

    try {
      setSubmitting(true);
      await api.post(`/courses/${selectedCourse._id}/enroll-cohort`, {
        cohort: selectedCohort,
      });
      setShowAssignModal(false);
      setSelectedCourse(null);
      setSelectedCohort("");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to assign this cohort.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading course management..." />;
  }

  return (
    <>
      <DashboardShell
        role="admin"
        title="Course management studio"
        subtitle="Create new courses, assign teachers, and enroll student cohorts using a cleaner admin experience with real LMS structure."
        tabs={adminTabs}
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Create course
            </button>
            <button
              type="button"
              onClick={loadData}
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

        <SectionCard
          title="Course catalog"
          subtitle="Search by title, code, teacher, or description."
          action={
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-fuchsia-400/40 sm:w-72"
            />
          }
        >
          {filteredCourses.length === 0 ? (
            <EmptyState
              title={courses.length === 0 ? "No courses created yet" : "No courses match your search"}
              description={
                courses.length === 0
                  ? "Create your first course, assign a teacher, and begin structuring your LMS content."
                  : "Try another search term to reveal matching courses."
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <article key={course._id} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{course.code}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{course.title}</h3>
                    </div>
                    <StatusBadge tone="info">{course.students?.length || 0} enrolled</StatusBadge>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{course.description}</p>

                  <div className="mt-5 rounded-[22px] border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                    <p>
                      Instructor: <span className="font-medium text-white">{course.instructor?.name || "Unassigned"}</span>
                    </p>
                    <p className="mt-2">Assignments: {course.assignments?.length || 0}</p>
                    <p className="mt-1">Materials: {course.materials?.length || 0}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openAssignModal(course)}
                      className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                      Assign cohort
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCourse(course._id)}
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

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create a new course"
        subtitle="Assign an approved teacher and prepare a solid foundation for course delivery."
      >
        <form onSubmit={createCourse} className="grid gap-5">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">Course title</span>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40"
              required
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Course code</span>
              <input
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40"
                placeholder="CS101"
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Assigned teacher</span>
              <select
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40"
                required
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40"
              required
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
            >
              {submitting ? "Creating..." : "Create course"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={selectedCourse ? `Assign cohort to ${selectedCourse.title}` : "Assign cohort"}
        subtitle="Enroll every approved student from a cohort into this course in one step."
        size="max-w-xl"
      >
        <div className="space-y-5">
          {availableCohorts.length === 0 ? (
            <EmptyState
              title="No cohorts available"
              description="Approve students and assign them to a cohort first, then return here to enroll them in a course."
            />
          ) : (
            <>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-200">Select cohort</span>
                <select
                  value={selectedCohort}
                  onChange={(event) => setSelectedCohort(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
                >
                  {availableCohorts.map((cohort) => (
                    <option key={cohort} value={cohort}>
                      {cohort}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-sm text-slate-400">
                Students in this cohort: {students.filter((student) => student.cohort === selectedCohort).length}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={assignCohort}
                  disabled={submitting || !selectedCohort}
                  className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-70"
                >
                  {submitting ? "Assigning..." : "Enroll cohort"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

const CourseIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
  </svg>
);

const TeacherIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 20.055 12.083 12.083 0 015.84 10.578L12 14zm0 0v6" />
  </svg>
);

const PeopleIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0a5 5 0 00-10 0M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0" />
  </svg>
);

const FolderIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
);

export default ManageCourses;
