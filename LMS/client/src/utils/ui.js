export const capitalize = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

export const getDashboardLink = (user) => {
  if (!user) return "/login";

  if (user.role === "admin") return "/admin";
  if (user.role === "teacher") return "/teacher";
  if (user.role === "student") return "/student";
  return "/dashboard";
};

export const formatDate = (value, options = {}) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(new Date(value));
};

export const formatDateTime = (value) =>
  formatDate(value, {
    hour: "2-digit",
    minute: "2-digit",
  });

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "L";

export const getAudienceLabel = (audience) => {
  switch (audience) {
    case "students":
      return "Students";
    case "teachers":
      return "Teachers";
    case "both":
      return "Everyone";
    default:
      return capitalize(audience);
  }
};

export const isMessageReadByUser = (message, userId) => {
  if (!message?.readBy || !userId) return false;

  return message.readBy.some((item) => {
    const id = typeof item.user === "object" ? item.user?._id : item.user;
    return id === userId;
  });
};

export const countUnreadMessages = (messages = [], userId) =>
  messages.filter((message) => !isMessageReadByUser(message, userId)).length;

export const getMaterialKey = (material, index) =>
  material?._id || `${material?.title || "material"}-${index}`;

export const getRoleTheme = (role) => {
  if (role === "admin") {
    return {
      badge: "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/30",
      panel: "from-fuchsia-500/15 via-violet-500/10 to-slate-900",
      accent: "from-fuchsia-500 to-violet-500",
    };
  }

  if (role === "teacher") {
    return {
      badge: "bg-sky-500/15 text-sky-100 ring-sky-400/30",
      panel: "from-sky-500/15 via-cyan-500/10 to-slate-900",
      accent: "from-sky-500 to-cyan-400",
    };
  }

  return {
    badge: "bg-emerald-500/15 text-emerald-100 ring-emerald-400/30",
    panel: "from-emerald-500/15 via-teal-500/10 to-slate-900",
    accent: "from-emerald-500 to-teal-400",
  };
};
