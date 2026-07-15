import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import React from "react";
import apiDebug from "../../utils/apiDebug";

const StudentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);

        console.log("Fetching messages for user:", user?._id);

        if (!token) {
          console.warn("No authentication token available");
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const response = await apiDebug.get("/messages");
        console.log("API response:", response.data);

        if (response.data.success) {
          setMessages(response.data.data);
          console.log("Messages loaded:", response.data.data.length);
        } else {
          setError("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        console.error("Error details:", error.response?.data);
        setError(
          error.response?.data?.error ||
            "An error occurred while fetching messages"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchMessages();
    } else {
      setLoading(false);
      setError("Please log in to view messages");
    }
  }, [user, token]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const markAsRead = async (id) => {
    try {
      console.log("Marking message as read:", id);
      const response = await apiDebug.put(`/messages/${id}/read`, {});

      if (response.data.success) {
        console.log("Message marked as read successfully");
        // Refresh message list to get updated read status
        const messagesResponse = await apiDebug.get("/messages");
        if (messagesResponse.data.success) {
          setMessages(messagesResponse.data.data);
        }
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Helper function to check if user has read a message
  const isMessageRead = (message) => {
    if (!user || !user._id) return false;

    const hasRead =
      message.readBy &&
      message.readBy.some(
        (item) =>
          item.user === user._id ||
          (typeof item.user === "object" && item.user._id === user._id)
      );

    return hasRead;
  };

  const reloadMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiDebug.get("/messages");
      if (response.data.success) {
        setMessages(response.data.data);
      } else {
        setError("Failed to reload messages");
      }
    } catch (error) {
      console.error("Failed to reload messages:", error);
      setError("An error occurred while reloading messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Messages</h1>
        <button
          onClick={reloadMessages}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-sm flex items-center"
          disabled={loading}
        >
          {loading ? (
            <span className="inline-block mr-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            </span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
          Reload
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">You don't have any messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const read = isMessageRead(message);

            return (
              <div
                key={message._id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  read ? "border-gray-300" : "border-primary-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h2
                    className={`text-lg font-semibold ${!read && "font-bold"}`}
                  >
                    {message.title}
                    {!read && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        New
                      </span>
                    )}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {formatDate(message.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  From: {message.sender?.name || "Admin"}
                </p>

                <div className="mt-4 text-gray-700">
                  <p>{message.content}</p>
                </div>

                {!read && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => markAsRead(message._id)}
                      className="text-sm bg-green-600 hover:bg-green-800 p-2 rounded-lg text-primary-600 hover:text-primary-800"
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      
    </div>
  );
};

export default StudentMessages;
