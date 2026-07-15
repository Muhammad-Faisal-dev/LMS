import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import DashboardShell from "../../components/ui/DashboardShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import LoadingState from "../../components/ui/LoadingState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { formatDate } from "../../utils/ui.js";

const teacherTabs = [
  { label: "Overview", to: "/teacher" },
  { label: "My courses", to: "/teacher/courses", active: true },
  { label: "Messages", to: "/teacher/messages" },
];

const emptyMaterial = {
  title: "",
  description: "",
  fileUrl: "",
  messageContent: "",
};

const emptyAssignment = {
  title: "",
  description: "",
  dueDate: "",
  totalPoints: 100,
};

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState("");
  const [materialModal, setMaterialModal] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [gradeModal, setGradeModal] = useState(false);
  const [materialType, setMaterialType] = useState("file");
  const [materialData, setMaterialData] = useState(emptyMaterial);
  const [assignmentData, setAssignmentData] = useState(emptyAssignment);
  const [gradeData, setGradeData] = useState({ grade: "", feedback: "", status: "graded" });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/courses");
      const list = response.data.data || [];
      setCourses(list);
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
      [course.title, course.code, course.description]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [courses, query]);

  const selectedCourse = useMemo(
    () => filteredCourses.find((course) => course._id === selectedCourseId) || filteredCourses[0] || null,
    [filteredCourses, selectedCourseId]
  );

  const loadSubmissions = useCallback(async (courseId) => {
    if (!courseId) {
      setSubmissions([]);
      return;
    }

    try {
      setSubmissionsLoading(true);
      const response = await api.get(`/submissions/course/${courseId}`);
      setSubmissions(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load course submissions.");
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourse?._id) {
      loadSubmissions(selectedCourse._id);
    }
  }, [loadSubmissions, selectedCourse?._id]);

  const stats = useMemo(() => {
    const students = courses.reduce((sum, course) => sum + (course.students?.length || 0), 0);
    const materials = courses.reduce((sum, course) => sum + (course.materials?.length || 0), 0);
    const assignments = courses.reduce((sum, course) => sum + (course.assignments?.length || 0), 0);

    return [
      <StatCard key="courses" label="Active courses" value={courses.length} hint="Courses currently under your supervision." accent="from-sky-400 to-cyan-500" icon={<CourseIcon />} />,
      <StatCard key="students" label="Students" value={students} hint="Learners enrolled across your classes." accent="from-emerald-400 to-teal-500" icon={<PeopleIcon />} />,
      <StatCard key="materials" label="Materials" value={materials} hint="Resources published to support learning." accent="from-amber-400 to-orange-500" icon={<FolderIcon />} />,
      <StatCard key="assignments" label="Assignments" value={assignments} hint="Deadlines and activities created for students." accent="from-fuchsia-500 to-violet-500" icon={<AssignmentIcon />} />,
    ];
  }, [courses]);

  const resetMaterialForm = () => {
    setMaterialData(emptyMaterial);
    setMaterialType("file");
    setUploadedFile(null);
    setUploadProgress(0);
  };

  const closeMaterialModal = () => {
    setMaterialModal(false);
    resetMaterialForm();
  };

  const closeAssignmentModal = () => {
    setAssignmentModal(false);
    setAssignmentData(emptyAssignment);
  };

  const closeGradeModal = () => {
    setGradeModal(false);
    setSelectedSubmission(null);
    setGradeData({ grade: "", feedback: "", status: "graded" });
  };

  const addMaterial = async (event) => {
    event.preventDefault();
    if (!selectedCourse) return;

    try {
      setSubmitting(true);
      let fileUrl = materialData.fileUrl;

      if (materialType === "file" && uploadedFile) {
        const form = new FormData();
        form.append("file", uploadedFile);
        const uploadResponse = await api.post("/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || 1;
            setUploadProgress(Math.round((progressEvent.loaded * 100) / total));
          },
        });
        fileUrl = uploadResponse.data.fileUrl;
      }

      await api.post(`/courses/${selectedCourse._id}/materials`, {
        ...materialData,
        type: materialType,
        fileUrl,
      });

      closeMaterialModal();
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to add material.");
    } finally {
      setSubmitting(false);
    }
  };

  const addAssignment = async (event) => {
    event.preventDefault();
    if (!selectedCourse) return;

    try {
      setSubmitting(true);
      await api.post(`/courses/${selectedCourse._id}/assignments`, assignmentData);
      closeAssignmentModal();
      await loadCourses();
      await loadSubmissions(selectedCourse._id);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to add assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    if (!selectedCourse) return;
    const confirmed = window.confirm("Delete this assignment?");
    if (!confirmed) return;

    try {
      await api.delete(`/courses/${selectedCourse._id}/assignments/${assignmentId}`);
      await loadCourses();
      await loadSubmissions(selectedCourse._id);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete assignment.");
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade ?? "",
      feedback: submission.feedback || "",
      status: submission.status === "graded" ? "graded" : "graded",
    });
    setGradeModal(true);
  };

  const saveGrade = async (event) => {
    event.preventDefault();
    if (!selectedSubmission) return;

    try {
      setSubmitting(true);
      await api.put(`/submissions/${selectedSubmission._id}/grade`, gradeData);
      closeGradeModal();
      await loadSubmissions(selectedCourse?._id);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to grade submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const submissionsByAssignment = useMemo(() => {
    return submissions.reduce((accumulator, submission) => {
      if (!accumulator[submission.assignmentId]) {
        accumulator[submission.assignmentId] = [];
      }
      accumulator[submission.assignmentId].push(submission);
      return accumulator;
    }, {});
  }, [submissions]);

  const detailTabs = [
    { key: "overview", label: "Overview" },
    { key: "materials", label: `Materials (${selectedCourse?.materials?.length || 0})` },
    { key: "assignments", label: `Assignments (${selectedCourse?.assignments?.length || 0})` },
    { key: "submissions", label: `Submissions (${submissions.length})` },
    { key: "students", label: `Students (${selectedCourse?.students?.length || 0})` },
  ];

  if (loading) {
    return <LoadingState label="Loading your teaching workspace..." />;
  }

  return (
    <>
      <DashboardShell
        role="teacher"
        title="Course delivery workspace"
        subtitle="Organize course materials, publish assignments, grade submissions, and review learners in one premium teaching interface."
        tabs={teacherTabs}
        actions={
          <>
            <button
              type="button"
              onClick={() => setMaterialModal(true)}
              disabled={!selectedCourse}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add material
            </button>
            <button
              type="button"
              onClick={() => setAssignmentModal(true)}
              disabled={!selectedCourse}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add assignment
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

        {courses.length === 0 ? (
          <EmptyState
            title="No teaching courses assigned"
            description="You will see course management tools here after an administrator assigns you to a course."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard
              title="Course list"
              subtitle="Choose a course to manage its content, grading, and enrolled students."
              action={
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search courses"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/40 sm:w-72"
                />
              }
            >
              <div className="space-y-3">
                {filteredCourses.map((course) => (
                  <button
                    key={course._id}
                    type="button"
                    onClick={() => setSelectedCourseId(course._id)}
                    className={`w-full rounded-[24px] border p-4 text-left transition ${
                      selectedCourse?._id === course._id
                        ? "border-sky-400/40 bg-sky-500/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{course.code}</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{course.title}</h3>
                      </div>
                      <StatusBadge tone="info">{course.students?.length || 0} students</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{course.materials?.length || 0} materials • {course.assignments?.length || 0} assignments</p>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title={selectedCourse?.title || "Course details"}
              subtitle={selectedCourse ? `${selectedCourse.code} • ${selectedCourse.students?.length || 0} enrolled students` : "Select a course to manage it."}
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
                            ? "border-sky-400/40 bg-sky-500/10 text-sky-100"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "overview" ? (
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="max-w-2xl text-sm leading-7 text-slate-300">{selectedCourse.description}</p>
                      <div className="mt-5 grid gap-4 sm:grid-cols-4">
                        <MiniMetric label="Students" value={selectedCourse.students?.length || 0} />
                        <MiniMetric label="Materials" value={selectedCourse.materials?.length || 0} />
                        <MiniMetric label="Assignments" value={selectedCourse.assignments?.length || 0} />
                        <MiniMetric label="Submissions" value={submissions.length} />
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "materials" ? (
                    <SectionCard title="Published materials" subtitle="Share files, links, or direct notes for your students." className="border-white/5 bg-slate-950/20 p-5">
                      {selectedCourse.materials?.length ? (
                        <div className="space-y-4">
                          {selectedCourse.materials.map((material, index) => (
                            <article key={`${material.title}-${index}`} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="font-semibold text-white">{material.title}</h3>
                                    <StatusBadge tone="info">{material.type || "material"}</StatusBadge>
                                  </div>
                                  <p className="mt-2 text-sm leading-7 text-slate-400">{material.description || "No description provided."}</p>
                                </div>
                                {material.fileUrl ? (
                                  <a href={material.fileUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                                    Open
                                  </a>
                                ) : null}
                              </div>
                              {material.messageContent ? (
                                <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                                  {material.messageContent}
                                </div>
                              ) : null}
                              <p className="mt-3 text-xs text-slate-500">Added {formatDate(material.uploadedAt)}</p>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <EmptyState title="No materials yet" description="Publish the first file, link, or note to start building this course." />
                      )}
                    </SectionCard>
                  ) : null}

                  {activeTab === "assignments" ? (
                    <SectionCard title="Assignments" subtitle="Create structured deadlines and keep track of response volume." className="border-white/5 bg-slate-950/20 p-5">
                      {selectedCourse.assignments?.length ? (
                        <div className="space-y-4">
                          {selectedCourse.assignments.map((assignment) => {
                            const assignmentSubmissions = submissionsByAssignment[assignment._id] || [];
                            const gradedCount = assignmentSubmissions.filter((item) => item.status === "graded").length;
                            return (
                              <article key={assignment._id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <h3 className="font-semibold text-white">{assignment.title}</h3>
                                      <StatusBadge tone="warning">Due {formatDate(assignment.dueDate)}</StatusBadge>
                                      <StatusBadge tone="info">{assignmentSubmissions.length} submitted</StatusBadge>
                                      <StatusBadge tone="success">{gradedCount} graded</StatusBadge>
                                    </div>
                                    <p className="mt-2 text-sm leading-7 text-slate-400">{assignment.description || "No description added."}</p>
                                    <p className="mt-3 text-sm text-slate-500">Total points: {assignment.totalPoints || 100}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => deleteAssignment(assignment._id)}
                                    className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <EmptyState title="No assignments yet" description="Create your first assignment so students can start preparing for deadlines." />
                      )}
                    </SectionCard>
                  ) : null}

                  {activeTab === "submissions" ? (
                    <SectionCard title="Assignment submissions" subtitle="Review incoming student work and publish grades with feedback." className="border-white/5 bg-slate-950/20 p-5">
                      {submissionsLoading ? (
                        <LoadingState label="Loading submissions..." />
                      ) : submissions.length ? (
                        <div className="space-y-4">
                          {submissions.map((submission) => (
                            <article key={submission._id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="font-semibold text-white">{submission.assignmentTitle}</h3>
                                    <StatusBadge tone={submission.status === "graded" ? "success" : "info"}>
                                      {submission.status}
                                    </StatusBadge>
                                  </div>
                                  <p className="mt-2 text-sm text-slate-400">
                                    {submission.student?.name} • {submission.student?.uniqueId || "No ID"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">Submitted {formatDate(submission.submittedAt)}</p>
                                  {submission.submissionText ? (
                                    <p className="mt-3 text-sm leading-7 text-slate-300">{submission.submissionText}</p>
                                  ) : null}
                                  {submission.attachmentUrl ? (
                                    <a href={submission.attachmentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                                      Open attachment
                                    </a>
                                  ) : null}
                                  {submission.grade !== null && submission.grade !== undefined ? (
                                    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                      Grade: {submission.grade} {submission.feedback ? `• Feedback: ${submission.feedback}` : ""}
                                    </div>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openGradeModal(submission)}
                                  className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                                >
                                  {submission.status === "graded" ? "Update grade" : "Grade submission"}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <EmptyState title="No submissions yet" description="Student submissions will appear here as soon as assignments are turned in." />
                      )}
                    </SectionCard>
                  ) : null}

                  {activeTab === "students" ? (
                    <SectionCard title="Enrolled students" subtitle="A quick list of learners currently assigned to this course." className="border-white/5 bg-slate-950/20 p-5">
                      {selectedCourse.students?.length ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          {selectedCourse.students.map((student) => (
                            <div key={student._id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                              <p className="font-semibold text-white">{student.name}</p>
                              <p className="mt-2 text-sm text-slate-400">{student.uniqueId || "No ID"}</p>
                              <p className="mt-1 text-sm text-slate-500">Cohort: {student.cohort || "Not assigned"}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState title="No students enrolled" description="Once a cohort or student is assigned to this course, the learner roster will appear here." />
                      )}
                    </SectionCard>
                  ) : null}
                </div>
              ) : (
                <EmptyState title="Select a course" description="Choose a course from the list to manage materials, assignments, grading, and learners." />
              )}
            </SectionCard>
          </div>
        )}
      </DashboardShell>

      <Modal
        open={materialModal}
        onClose={closeMaterialModal}
        title={`Add material${selectedCourse ? ` • ${selectedCourse.title}` : ""}`}
        subtitle="Upload a file, share a link, or post a direct note inside the course."
      >
        <form onSubmit={addMaterial} className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "File", value: "file" },
              { label: "Link", value: "link" },
              { label: "Message", value: "message" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMaterialType(option.value)}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  materialType === option.value
                    ? "border-sky-400/40 bg-sky-500/10 text-sky-100"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">Title</span>
            <input value={materialData.title} onChange={(event) => setMaterialData((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-sky-400/40" required />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">Description</span>
            <input value={materialData.description} onChange={(event) => setMaterialData((prev) => ({ ...prev, description: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-sky-400/40" />
          </label>

          {materialType === "file" ? (
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Upload file</span>
              <input type="file" onChange={(event) => setUploadedFile(event.target.files?.[0] || null)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-sky-500 file:px-3 file:py-2 file:font-semibold file:text-slate-950" />
              {uploadProgress > 0 ? (
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400" style={{ width: `${uploadProgress}%` }} />
                </div>
              ) : null}
            </label>
          ) : null}

          {materialType === "link" ? (
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Resource link</span>
              <input type="url" value={materialData.fileUrl} onChange={(event) => setMaterialData((prev) => ({ ...prev, fileUrl: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-sky-400/40" placeholder="https://example.com/resource" required />
            </label>
          ) : null}

          {materialType === "message" ? (
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Message</span>
              <textarea value={materialData.messageContent} onChange={(event) => setMaterialData((prev) => ({ ...prev, messageContent: event.target.value }))} rows="5" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-sky-400/40" required />
            </label>
          ) : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeMaterialModal} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 disabled:opacity-70">
              {submitting ? "Publishing..." : "Publish material"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={assignmentModal}
        onClose={closeAssignmentModal}
        title={`Add assignment${selectedCourse ? ` • ${selectedCourse.title}` : ""}`}
        subtitle="Set a clear deadline and points value so students know exactly what matters."
      >
        <form onSubmit={addAssignment} className="space-y-5">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">Assignment title</span>
            <input value={assignmentData.title} onChange={(event) => setAssignmentData((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-sky-400/40" required />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">Description</span>
            <textarea value={assignmentData.description} onChange={(event) => setAssignmentData((prev) => ({ ...prev, description: event.target.value }))} rows="5" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-sky-400/40" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Due date</span>
              <input type="date" value={assignmentData.dueDate} onChange={(event) => setAssignmentData((prev) => ({ ...prev, dueDate: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-sky-400/40" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Total points</span>
              <input type="number" min="1" value={assignmentData.totalPoints} onChange={(event) => setAssignmentData((prev) => ({ ...prev, totalPoints: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-sky-400/40" />
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeAssignmentModal} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 disabled:opacity-70">
              {submitting ? "Publishing..." : "Create assignment"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={gradeModal}
        onClose={closeGradeModal}
        title={selectedSubmission ? `Grade ${selectedSubmission.student?.name}` : "Grade submission"}
        subtitle="Publish points and constructive feedback for the student's work."
      >
        <form onSubmit={saveGrade} className="space-y-5">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">Grade</span>
            <input type="number" min="0" value={gradeData.grade} onChange={(event) => setGradeData((prev) => ({ ...prev, grade: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-400/40" required />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-200">Feedback</span>
            <textarea value={gradeData.feedback} onChange={(event) => setGradeData((prev) => ({ ...prev, feedback: event.target.value }))} rows="5" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-400/40" placeholder="Share what was done well and what can be improved." />
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeGradeModal} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-70">
              {submitting ? "Saving..." : "Save grade"}
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

const AssignmentIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5h6m-6 4h6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h2.5a1.5 1.5 0 001.5 1h2a1.5 1.5 0 001.5-1H17a2 2 0 012 2v12a2 2 0 01-2 2z" />
  </svg>
);

export default TeacherCourses;
