import React from "react";
import MessageCenter from "../../components/messages/MessageCenter.jsx";

const StudentMessages = () => {
  return (
    <MessageCenter
      role="student"
      title="Student inbox"
      subtitle="Read announcements from the administration, track unread updates, and keep your academic workflow organized."
    />
  );
};

export default StudentMessages;
