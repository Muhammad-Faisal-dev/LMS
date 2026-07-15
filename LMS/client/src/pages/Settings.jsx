import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/api";
import DashboardShell from "../components/ui/DashboardShell.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import { setUser } from "../features/auth/authSlice.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    avatarUrl: "",
    preferences: {
      emailNotifications: true,
      assignmentAlerts: true,
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users/me");
        const data = response.data.data;
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
          website: data.website || "",
          avatarUrl: data.avatarUrl || "",
          preferences: {
            emailNotifications: data.preferences?.emailNotifications ?? true,
            assignmentAlerts: data.preferences?.assignmentAlerts ?? true,
          },
        });
        dispatch(setUser(data));
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load your profile settings.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [dispatch]);

  const tabs = useMemo(() => {
    if (user?.role === "admin") {
      return [
        { label: "Overview", to: "/admin" },
        { label: "Settings", to: "/settings", active: true },
      ];
    }

    if (user?.role === "teacher") {
      return [
        { label: "Overview", to: "/teacher" },
        { label: "Settings", to: "/settings", active: true },
      ];
    }

    return [
      { label: "Overview", to: "/student" },
      { label: "Settings", to: "/settings", active: true },
    ];
  }, [user?.role]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPreferenceChange = (event) => {
    const { name, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked,
      },
    }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = await api.put("/users/me", form);
      dispatch(setUser(response.data.data));
      setMessage("Your profile settings were updated successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading your settings..." />;
  }

  return (
    <DashboardShell
      role={user?.role || "student"}
      title="Profile & settings"
      subtitle="Update your profile information, personalize your experience, and control notification preferences."
      tabs={tabs}
      actions={<ThemeToggle />}
    >
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Profile preview" subtitle="A quick view of how your identity appears in the LMS.">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-cyan-400 to-violet-500 text-2xl font-bold text-slate-950">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt={form.name} className="h-full w-full object-cover" />
              ) : (
                (form.name || user?.name || "L")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
              )}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">{form.name || user?.name}</h3>
            <p className="mt-2 text-sm text-slate-400">{user?.role} {user?.uniqueId ? `• ${user.uniqueId}` : ""}</p>
            {user?.cohort ? <p className="mt-2 text-sm text-slate-500">Cohort: {user.cohort}</p> : null}
            <p className="mt-4 text-sm leading-7 text-slate-400">{form.bio || "Your bio will appear here once you add one."}</p>
          </div>
        </SectionCard>

        <SectionCard title="Edit profile" subtitle="Keep your LMS identity and preferences up to date.">
          <form onSubmit={saveSettings} className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Full name</span>
              <input name="name" value={form.name} onChange={onChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40" required />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Phone</span>
              <input name="phone" value={form.phone} onChange={onChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Location</span>
              <input name="location" value={form.location} onChange={onChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Website</span>
              <input name="website" value={form.website} onChange={onChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-200">Avatar image URL</span>
              <input name="avatarUrl" value={form.avatarUrl} onChange={onChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-200">Bio</span>
              <textarea name="bio" value={form.bio} onChange={onChange} rows="5" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/40" />
            </label>

            <div className="sm:col-span-2 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-lg font-semibold text-white">Notification preferences</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                  <input type="checkbox" name="emailNotifications" checked={form.preferences.emailNotifications} onChange={onPreferenceChange} />
                  Email style notifications enabled
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                  <input type="checkbox" name="assignmentAlerts" checked={form.preferences.assignmentAlerts} onChange={onPreferenceChange} />
                  Assignment alerts enabled
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-70">
                {saving ? "Saving..." : "Save settings"}
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </DashboardShell>
  );
};

export default Settings;
