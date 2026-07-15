import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import DashboardShell from "../../components/ui/DashboardShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import LoadingState from "../../components/ui/LoadingState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import {
  createProgressMap,
  getCourseProgress,
  isMaterialCompleted,
  upsertProgressMap,
} from "../../utils/progress.js";
import { formatDate } from "../../utils/ui.js";

const studentTabs = [
  { label: "Overview", to: "/student" },
  { label: "My courses", to: "/student/courses", active: true },
  { label: "Messages", to: "/student/messages" },
];

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitModal, setSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({
    submissionText: "",
    attachmentUrl: "",
  });
  const [submissionFile, setSubmissionFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [coursesResponse, progressResponse] = await Promise.all([
        api.get("/courses"),
        api.get("/progress/my"),
      ]);

      const list = coursesResponse.data.data || [];
      setCourses(list);
      setProgressMap(createProgressMap(progressResponse.data.data || []));
      setSelectedCourseId((current) => current || list[0]?._id || "");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load your courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = useMemo(() => {
    const term = query.toLowerCase();
    return courses.filter((course) =>
      [course.title, course.code, course.description, course.instructor?.name]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [courses, query]);

  const selectedCourse = useMemo(
    () =>
      filteredCourses.find((course) => course._id === selectedCourseId) ||
      filteredCourses[0] ||
      null,
    [filteredCourses, selectedCourseId]
  );

  const loadSubmissions = useCallback(async (courseId) => {
    if (!courseId) {
      setSubmissions([]);
      return;
    }

    try {
      setSubmissionsLoading(true);
      const response = await api.get(`/submissions/my?courseId=${courseId}`);
      setSubmissions(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load your assignment submissions.");
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourse?._id) {
      loadSubmissions(selectedCourse._id);
    }
  }, [loadSubmissions, selectedCourse?._id]);

  const progressTotals = useMemo(() => {
    const totalCourses = courses.length;
    const materials = courses.reduce(
      (sum, course) => sum + (course.materials?.length || 0),
      0
    );
    const completed = courses.reduce(
      (sum, course) => sum + getCourseProgress(progressMap, course).completed,
      0
    );

    return { totalCourses, materials, completed };
  }, [courses, progressMap]);

  const toggleCompletion = async (courseId, materialId, completed) => {
    try {
      await api.put(`/progress/course/${courseId}/material/${materialId}`, { completed });
      setProgressMap((current) =>
        upsertProgressMap(current, courseId, materialId, completed)
      );
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update course progress.");
    }
  };

  const submissionMap = useMemo(
    () =>
      submissions.reduce((accumulator, submission) => {
        accumulator[submission.assignmentId] = submission;
        return accumulator;
      }, {}),
    [submissions]
  );

  const openSubmitModal = (assignment) => {
    const existing = submissionMap[assignment._id];
    setSelectedAssignment(assignment);
    setSubmissionForm({
      submissionText: existing?.submissionText || "",
      attachmentUrl: existing?.attachmentUrl || "",
    });
    setSubmissionFile(null);
    setUploadProgress(0);
    setSubmitModal(true);
  };

  const closeSubmitModal = () => {
    setSubmitModal(false);
    setSelectedAssignment(null);
    setSubmissionForm({ submissionText: "", attachmentUrl: "" });
    setSubmissionFile(null);
    setUploadProgress(0);
  };

  const submitAssignment = async (event) => {
    event.preventDefault();
    if (!selectedCourse || !selectedAssignment) return;

    try {
      setSubmitting(true);
      let attachmentUrl = submissionForm.attachmentUrl;

      if (submissionFile) {
        const formData = new FormData();
        formData.append("file", submissionFile);
        const uploadResponse = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || 1;
            setUploadProgress(Math.round((progressEvent.loaded * 100) / total));
          },
        });
        attachmentUrl = uploadResponse.data.fileUrl;
      }

      await api.post("/submissions", {
        courseId: selectedCourse._id,
        assignmentId: selectedAssignment._id,
        submissionText: submissionForm.submissionText,
        attachmentUrl,
      });

      closeSubmitModal();
      await loadSubmissions(selectedCourse._id);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to submit assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading your courses..." />;
  }

  const detailTabs = [
    { key: "overview", label: "Overview" },
    {
      key: "materials",
      label: `Materials (${selectedCourse?.materials?.length || 0})`,
    },
    {
      key: "assignments",
      label: `Assignments (${selectedCourse?.assignments?.length || 0})`,
    },
    { key: "submissions", label: `Submissions (${submissions.length})` },
  ];

  return (
    <>
      <DashboardShell
        role="student"
        title="My courses"
        subtitle="Browse enrolled courses, read materials, review assignments, and keep your database-synced progress updated from a tabbed course workspace."
        tabs={studentTabs}
        actions={
          <button
            type="button"
            onClick={loadCourses}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Refresh courses
          </button>
        }
        stats={[
          <StatCard
            key="courses"
            label="Enrolled courses"
            value={progressTotals.totalCourses}
            hint="Your active learning catalog."
            accent="from-emerald-400 to-teal-500"
            icon={<CourseIcon />}
          />,
          <StatCard
            key="materials"
            label="Materials"
            value={progressTotals.materials}
            hint="Resources available across your courses."
            accent="from-cyan-400 to-sky-500"
            icon={<FolderIcon />}
          />,
          <StatCard
            key="completed"
            label="Completed items"
            value={progressTotals.completed}
            hint="Materials stored as completed in the database."
            accent="from-fuchsia-500 to-violet-500"
            icon={<CheckIcon />}
          />,
        ]}
      >
        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {courses.length === 0 ? (
          <EmptyState
            title="You are not enrolled in any courses"
            description="Once an admin or teacher adds you to a course, it will appear here with materials, assignments, submissions, and saved progress."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
            <SectionCard
              title="Course list"
              subtitle="Choose a course to inspect its content and assignments."
              action={
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search courses"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40 sm:w-72"
                />
              }
            >
              <div className="space-y-3">
                {filteredCourses.map((course) => {
                  const progress = getCourseProgress(progressMap, course);
                  return (
                    <button
                      key={course._id}
                      type="button"
                      onClick={() => setSelectedCourseId(course._id)}
                      className={`w-full rounded-[24px] border p-4 text-left transition ${
                        selectedCourse?._id === course._id
                          ? "border-emerald-400/40 bg-emerald-500/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            {course.code}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-white">
                            {course.title}
                          </h3>
                        </div>
                        <StatusBadge tone="success">
                          {progress.percentage}%
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Instructor: {course.instructor?.name || "TBA"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title={selectedCourse?.title || "Course details"}
              subtitle={
                selectedCourse
                  ? `${selectedCourse.code} • Instructor: ${selectedCourse.instructor?.name || "TBA"}`
                  : "Select a course to continue."
              }
            >
              {selectedCourse ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {detailTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                          activeTab === tab.key
                            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "overview" ? (
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="max-w-2xl text-sm leading-7 text-slate-300">
                          {selectedCourse.description}
                        </p>
                        <StatusBadge tone="success">
                          {getCourseProgress(progressMap, selectedCourse).completed}/
                          {getCourseProgress(progressMap, selectedCourse).total || 0} completed
                        </StatusBadge>
                      </div>
                      <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <MiniMetric
                          label="Materials"
                          value={selectedCourse.materials?.length || 0}
                        />
                        <MiniMetric
                          label="Assignments"
                          value={selectedCourse.assignments?.length || 0}
                        />
                        <MiniMetric label="Submissions" value={submissions.length} />
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "materials" ? (
                    <SectionCard
                      title="Materials"
                      subtitle="Mark resources as completed to track your progress in the database."
                      className="border-white/5 bg-slate-950/20 p-5"
                    >
                      {selectedCourse.materials?.length ? (
                        <div className="space-y-4">
                          {selectedCourse.materials.map((material) => {
                            const materialId = material?._id;
                            const completed = isMaterialCompleted(
                              progressMap,
                              selectedCourse._id,
                              materialId
                            );

                            return (
                              <article
                                key={String(materialId)}
                                className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <h3 className="font-semibold text-white">
                                        {material.title}
                                      </h3>
                                      <StatusBadge tone={completed ? "success" : "neutral"}>
                                        {completed ? "Completed" : material.type || "Material"}
                                      </StatusBadge>
                                    </div>
                                    <p className="mt-2 text-sm leading-7 text-slate-400">
                                      {material.description || "No description added."}
                                    </p>
                                    {material.messageContent ? (
                                      <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                                        {material.messageContent}
                                      </div>
                                    ) : null}
                                    <p className="mt-3 text-xs text-slate-500">
                                      Added {formatDate(material.uploadedAt)}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-3 lg:justify-end">
                                    {material.fileUrl ? (
                                      <a
                                        href={material.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                                      >
                                        Open resource
                                      </a>
                                    ) : null}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleCompletion(
                                          selectedCourse._id,
                                          materialId,
                                          !completed
                                        )
                                      }
                                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                                        completed
                                          ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                          : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                                      }`}
                                    >
                                      {completed ? "Mark incomplete" : "Mark complete"}
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <EmptyState
                          title="No materials added"
                          description="This course has not published learning materials yet."
                        />
                      )}
                    </SectionCard>
                  ) : null}

                  {activeTab === "assignments" ? (
                    <SectionCard
                      title="Assignments"
                      subtitle="Submit your work and track grades from one place."
                      className="border-white/5 bg-slate-950/20 p-5"
                    >
                      {selectedCourse.assignments?.length ? (
                        <div className="space-y-4">
                          {selectedCourse.assignments.map((assignment) => {
                            const submission = submissionMap[assignment._id];
                            return (
                              <article
                                key={assignment._id}
                                className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <h3 className="font-semibold text-white">
                                        {assignment.title}
                                      </h3>
                                      <StatusBadge tone="warning">
                                        Due {formatDate(assignment.dueDate)}
                                      </StatusBadge>
                                      {submission ? (
                                        <StatusBadge
                                          tone={submission.status === "graded" ? "success" : "info"}
                                        >
                                          {submission.status}
                                        </StatusBadge>
                                      ) : null}
                                    </div>
                                    <p className="mt-2 text-sm leading-7 text-slate-400">
                                      {assignment.description ||
                                        "No additional details provided."}
                                    </p>
                                    <p className="mt-3 text-sm text-slate-500">
                                      Total points: {assignment.totalPoints || 100}
                                    </p>
                                    {submission?.grade !== null &&
                                    submission?.grade !== undefined ? (
                                      <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                        Grade: {submission.grade}
                                        {submission.feedback
                                          ? ` • Feedback: ${submission.feedback}`
                                          : ""}
                                      </div>
                                    ) : null}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openSubmitModal(assignment)}
                                    className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                                  >
                                    {submission ? "Update submission" : "Submit assignment"}
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <EmptyState
                          title="No assignments yet"
                          description="Your teacher has not posted any assignments for this course yet."
                        />
                      )}
                    </SectionCard>
                  ) : null}

                  {activeTab === "submissions" ? (
                    <SectionCard
                      title="My submissions"
                      subtitle="Review everything you have submitted for this course."
                      className="border-white/5 bg-slate-950/20 p-5"
                    >
                      {submissionsLoading ? (
                        <LoadingState label="Loading submissions..." />
                      ) : submissions.length ? (
                        <div className="space-y-4">
                          {submissions.map((submission) => (
                            <article
                              key={submission._id}
                              className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <h3 className="font-semibold text-white">
                                  {submission.assignmentTitle}
                                </h3>
                                <StatusBadge
                                  tone={submission.status === "graded" ? "success" : "info"}
                                >
                                  {submission.status}
                                </StatusBadge>
                              </div>
                              <p className="mt-2 text-sm text-slate-400">
                                Submitted {formatDate(submission.submittedAt)}
                              </p>
                              {submission.submissionText ? (
                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                  {submission.submissionText}
                                </p>
                              ) : null}
                              {submission.attachmentUrl ? (
                                <a
                                  href={submission.attachmentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-3 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                                >
                                  Open attachment
                                </a>
                              ) : null}
                              {submission.grade !== null &&
                              submission.grade !== undefined ? (
                                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                  Grade: {submission.grade}
                                  {submission.feedback
                                    ? ` • Feedback: ${submission.feedback}`
                                    : ""}
                                </div>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="No submissions yet"
                          description="Submit an assignment and it will appear here for easy tracking."
                        />
                      )}
                    </SectionCard>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  title="Select a course"
                  description="Choose a course from the list to see full details, materials, assignments, and submissions."
                />
              )}
            </SectionCard>
          </div>
        )}
      </DashboardShell>

      <Modal
        open={submitModal}
        onClose={closeSubmitModal}
        title={selectedAssignment ? `Submit ${selectedAssignment.title}` : "Submit assignment"}
        subtitle="Share your answer, attach a resource if needed, and update the submission anytime before grading."
      >
        <form onSubmit={submitAssignment} className="space-y-5">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Submission text
            </span>
            <textarea
              value={submissionForm.submissionText}
              onChange={(event) =>
                setSubmissionForm((prev) => ({
                  ...prev,
                  submissionText: event.target.value,
                }))
              }
              rows="6"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
              placeholder="Write your answer or summary here..."
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Attachment link (optional)
            </span>
            <input
              value={submissionForm.attachmentUrl}
              onChange={(event) =>
                setSubmissionForm((prev) => ({
                  ...prev,
                  attachmentUrl: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
              placeholder="https://drive.google.com/..."
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Or upload a file
            </span>
            <input
              type="file"
              onChange={(event) => setSubmissionFile(event.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:font-semibold file:text-slate-950"
            />
            {uploadProgress > 0 ? (
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            ) : null}
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeSubmitModal}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Save submission"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

const MiniMetric = ({ label, value }) => (
  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
  </div>
);

const CourseIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13"
    />
  </svg>
);

const FolderIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export default StudentCourses;
