import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import DashboardShell from "../../components/ui/DashboardShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import LoadingState from "../../components/ui/LoadingState.jsx";
import SectionCard from "../../components/ui/SectionCard.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { formatDate } from "../../utils/ui.js";

const adminTabs = [
  { label: "Overview", to: "/admin" },
  { label: "Pending approvals", to: "/admin/pending-approvals" },
  { label: "Manage users", to: "/admin/manage-users", active: true },
  { label: "Manage courses", to: "/admin/manage-courses" },
  { label: "Send message", to: "/admin/send-message" },
];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingCohort, setSavingCohort] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      setUsers(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" ? user.isApproved : !user.isApproved);
      const matchesSearch = [user.name, user.email, user.uniqueId, user.cohort]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [query, roleFilter, statusFilter, users]);

  const stats = useMemo(() => {
    const approved = users.filter((user) => user.isApproved).length;
    const pending = users.length - approved;
    const teachers = users.filter((user) => user.role === "teacher").length;
    const students = users.filter((user) => user.role === "student").length;

    return [
      <StatCard key="users" label="Total users" value={users.length} hint="Everyone registered in the platform." accent="from-cyan-400 to-sky-500" icon={<PeopleIcon />} />,
      <StatCard key="approved" label="Approved" value={approved} hint="Users who can log in right now." accent="from-emerald-400 to-teal-500" icon={<CheckIcon />} />,
      <StatCard key="pending" label="Pending" value={pending} hint="Registrations still waiting for approval." accent="from-amber-400 to-orange-500" icon={<ClockIcon />} />,
      <StatCard key="teachers" label="Teachers / Students" value={`${teachers} / ${students}`} hint="A quick view of your user mix." accent="from-fuchsia-500 to-violet-500" icon={<TeacherIcon />} />,
    ];
  }, [users]);

  const updateCohort = async (userId, cohort) => {
    try {
      setSavingCohort(userId);
      await api.put(`/users/${userId}/cohort`, { cohort });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update student cohort.");
    } finally {
      setSavingCohort("");
    }
  };

  if (loading) {
    return <LoadingState label="Loading user management..." />;
  }

  return (
    <DashboardShell
      role="admin"
      title="User management"
      subtitle="Search and filter every account, review approval status, and adjust student cohorts without leaving the dashboard."
      tabs={adminTabs}
      actions={
        <button
          type="button"
          onClick={loadUsers}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Refresh users
        </button>
      }
      stats={stats}
    >
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <SectionCard
        title="All users"
        subtitle="Filter by role or status and quickly inspect the entire user base."
        action={
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-fuchsia-400/40"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/40"
            >
              <option value="all">All roles</option>
              <option value="admin">Admins</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/40"
            >
              <option value="all">All status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        }
      >
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try changing your search or filters to reveal more accounts."
          />
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <article key={user._id} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <StatusBadge tone={user.isApproved ? "success" : "warning"}>
                        {user.isApproved ? "Approved" : "Pending"}
                      </StatusBadge>
                      <StatusBadge tone={user.role === "student" ? "success" : user.role === "teacher" ? "info" : "danger"}>
                        {user.role}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{user.email}</p>
                    <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-500">
                      <span>ID: {user.uniqueId || "Not assigned"}</span>
                      <span>Registered: {formatDate(user.registeredOn)}</span>
                      {user.role === "student" ? <span>Cohort: {user.cohort || "Not assigned"}</span> : null}
                    </div>
                  </div>

                  {user.role === "student" ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        value={user.cohort || "Foundation"}
                        onChange={(event) => updateCohort(user._id, event.target.value)}
                        disabled={savingCohort === user._id}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/40"
                      >
                        {["Foundation", "Batch A", "Batch B", "Weekend", "Evening"].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {savingCohort === user._id ? (
                        <span className="text-sm text-slate-400">Saving...</span>
                      ) : null}
                    </div>
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

const PeopleIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0a5 5 0 00-10 0M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TeacherIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 20.055 12.083 12.083 0 015.84 10.578L12 14zm0 0v6" />
  </svg>
);

export default ManageUsers;
