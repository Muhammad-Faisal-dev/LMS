import React from "react";
import MessageCenter from "../../components/messages/MessageCenter.jsx";

const TeacherMessages = () => {
  return (
    <MessageCenter
      role="teacher"
      title="Teacher inbox"
      subtitle="Stay updated on administrative announcements, scheduling changes, and platform-wide notices."
    />
  );
};

export default TeacherMessages;
