const Notification = require("../models/Notification");
const User = require("../models/User");
const { emitToUser, emitToUsers } = require("../socket");

const emitNotificationPayload = (notification) => ({
  type: "notification:new",
  data: notification,
});

const createNotificationForUser = async ({
  recipient,
  title,
  message,
  type = "system",
  link = "",
  metadata = {},
}) => {
  if (!recipient || !title || !message) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    link,
    metadata,
  });

  emitToUser(String(recipient), "notification:new", emitNotificationPayload(notification));
  emitToUser(String(recipient), "notifications:refresh", { reason: "created" });

  return notification;
};

const createNotificationsForUsers = async ({
  recipients = [],
  title,
  message,
  type = "system",
  link = "",
  metadata = {},
}) => {
  const uniqueRecipients = Array.from(
    new Set(recipients.map((item) => String(item)).filter(Boolean))
  );

  if (!uniqueRecipients.length || !title || !message) {
    return [];
  }

  const payload = uniqueRecipients.map((recipient) => ({
    recipient,
    title,
    message,
    type,
    link,
    metadata,
  }));

  const notifications = await Notification.insertMany(payload);

  emitToUsers(uniqueRecipients, "notifications:refresh", { reason: "bulk-created" });
  emitToUsers(uniqueRecipients, "notification:new", (userId) => ({
    type: "notification:new",
    data:
      notifications.find(
        (notification) => notification.recipient.toString() === userId.toString()
      ) || null,
  }));

  return notifications;
};

const createNotificationsForAudience = async ({
  roles = [],
  title,
  message,
  type = "system",
  link = "",
  metadata = {},
  excludeUserIds = [],
}) => {
  if (!roles.length) {
    return [];
  }

  const filters = {
    role: { $in: roles },
    isApproved: true,
  };

  if (excludeUserIds.length) {
    filters._id = { $nin: excludeUserIds };
  }

  const users = await User.find(filters).select("_id");

  return createNotificationsForUsers({
    recipients: users.map((user) => user._id),
    title,
    message,
    type,
    link,
    metadata,
  });
};

module.exports = {
  createNotificationForUser,
  createNotificationsForUsers,
  createNotificationsForAudience,
};
