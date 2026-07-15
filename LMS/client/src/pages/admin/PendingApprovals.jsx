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

const adminTabs = [
  { label: "Overview", to: "/admin" },
  { label: "Pending approvals", to: "/admin/pending-approvals", active: true },
  { label: "Manage users", to: "/admin/manage-users" },
  { label: "Manage courses", to: "/admin/manage-courses" },
  { label: "Send message", to: "/admin/send-message" },
];

const cohortOptions = ["Foundation", "Batch A", "Batch B", "Weekend", "Evening"];

const PendingApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState(cohortOptions[0]);
  const [submitting, setSubmitting] = useState(false);

  const loadPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users/pending");
      setUsers(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load pending approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingUsers();
  }, [loadPendingUsers]);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return users;

    return users.filter((user) =>
      [user.name, user.email, user.uniqueId, user.role].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search)
      )
    );
  }, [query, users]);

  const counts = useMemo(
    () => ({
      total: users.length,
      students: users.filter((user) => user.role === "student").length,
      teachers: users.filter((user) => user.role === "teacher").length,
    }),
    [users]
  );

  const openApproval = (user) => {
    setSelectedUser(user);
    setSelectedCohort(user.cohort || cohortOptions[0]);
  };

  const closeApproval = () => {
    setSelectedUser(null);
    setSelectedCohort(cohortOptions[0]);
  };

  const approveUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      await api.put(`/users/${selectedUser._id}/approve`, {
        cohort: selectedUser.role === "student" ? selectedCohort : "",
      });
      closeApproval();
      await loadPendingUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to approve this user.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this pending registration?");
    if (!confirmed) return;

    try {
      await api.delete(`/users/${id}`);
      await loadPendingUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete this user.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading pending approvals..." />;
  }

  return (
    <>
      <DashboardShell
        role="admin"
        title="Pending approval workflow"
        subtitle="Approve incoming users, assign students to cohorts, and keep onboarding smooth with a cleaner management experience."
        tabs={adminTabs}
        actions={
          <button
            type="button"
            onClick={loadPendingUsers}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Refresh queue
          </button>
        }
        stats={[
          <StatCard key="total" label="In queue" value={counts.total} hint="All users waiting for approval." accent="from-amber-400 to-orange-500" icon={<ClockIcon />} />,
          <StatCard key="students" label="Students" value={counts.students} hint="Assign each one to a cohort before approval." accent="from-emerald-400 to-teal-500" icon={<StudentIcon />} />,
          <StatCard key="teachers" label="Teachers" value={counts.teachers} hint="Approved teachers can immediately access their course tools." accent="from-cyan-400 to-sky-500" icon={<TeacherIcon />} />,
        ]}
      >
        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <SectionCard
          title="Approval queue"
          subtitle="Search by name, email, role, or ID before approving or removing a registration."
          action={
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pending users"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-fuchsia-400/40 sm:w-72"
            />
          }
        >
          {filteredUsers.length === 0 ? (
            <EmptyState
              title={users.length === 0 ? "Approval queue is clear" : "No users match your search"}
              description={
                users.length === 0
                  ? "You have handled every registration for now. New requests will appear here automatically."
                  : "Try another search term or clear the filter to see the full queue again."
              }
            />
          ) : (
            <div className="overflow-hidden rounded-[26px] border border-white/10">
              <div className="hidden grid-cols-[1.2fr_1.3fr_0.7fr_0.8fr_0.8fr] gap-4 bg-white/[0.04] px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 lg:grid">
                <span>User</span>
                <span>Email</span>
                <span>Role</span>
                <span>ID</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="grid gap-4 bg-white/[0.02] px-5 py-5 lg:grid-cols-[1.2fr_1.3fr_0.7fr_0.8fr_0.8fr] lg:items-center">
                    <div>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="mt-1 text-sm text-slate-500">Registered {formatDate(user.registeredOn)}</p>
                    </div>
                    <p className="text-sm text-slate-300">{user.email}</p>
                    <div>
                      <StatusBadge tone={user.role === "student" ? "success" : user.role === "teacher" ? "info" : "danger"}>
                        {user.role}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-slate-400">{user.uniqueId || "Will be assigned"}</p>
                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openApproval(user)}
                        className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(user._id)}
                        className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </DashboardShell>

      <Modal
        open={Boolean(selectedUser)}
        onClose={closeApproval}
        title={selectedUser ? `Approve ${selectedUser.name}` : "Approve user"}
        subtitle={
          selectedUser?.role === "student"
            ? "Choose a cohort so the student can be grouped for future course assignment."
            : "Teacher and admin accounts can be approved immediately."
        }
        size="max-w-xl"
      >
        {selectedUser ? (
          <div className="space-y-6">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-white">{selectedUser.name}</h3>
                <StatusBadge tone={selectedUser.role === "student" ? "success" : selectedUser.role === "teacher" ? "info" : "danger"}>
                  {selectedUser.role}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm text-slate-400">{selectedUser.email}</p>
              <p className="mt-1 text-sm text-slate-500">Registered {formatDate(selectedUser.registeredOn)}</p>
            </div>

            {selectedUser.role === "student" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Student cohort</span>
                <select
                  value={selectedCohort}
                  onChange={(event) => setSelectedCohort(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-fuchsia-400/40"
                >
                  {cohortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeApproval}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={approveUser}
                disabled={submitting}
                className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-70"
              >
                {submitting ? "Approving..." : "Approve user"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

const ClockIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StudentIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
  </svg>
);

const TeacherIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0a5 5 0 00-10 0m10 0v0M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0" />
  </svg>
);

export default PendingApprovals;
