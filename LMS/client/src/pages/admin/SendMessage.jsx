import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import React from "react";
import apiDebug from "../../utils/apiDebug";

const SendMessage = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "both",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [sentMessages, setSentMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { title, content, targetAudience } = formData;

  useEffect(() => {
    fetchSentMessages();
  }, []);

  const fetchSentMessages = async () => {
    try {
      setLoadingMessages(true);
      const response = await apiDebug.get("/messages/admin");

      if (response.data.success) {
        setSentMessages(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching sent messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await apiDebug.post("/messages", {
        title,
        content,
        targetAudience,
      });

      setSuccess(true);
      setFormData({
        title: "",
        content: "",
        targetAudience: "both",
      });

      // Refresh the sent messages list
      fetchSentMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message");
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const getTargetAudienceDisplay = (audience) => {
    switch (audience) {
      case "students":
        return "Students Only";
      case "teachers":
        return "Teachers Only";
      case "both":
        return "Students & Teachers";
      default:
        return audience;
    }
  };

  const deleteMessage = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await apiDebug.delete(`/messages/${id}`);
        if (response.data.success) {
          fetchSentMessages();
        }
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Send Message</h1>

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Message sent successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4h2V9H9zm0-4v2h2V5H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="title"
            >
              Message Title
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="title"
              type="text"
              name="title"
              value={title}
              onChange={onChange}
              placeholder="Enter message title"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="content"
            >
              Message Content
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="content"
              name="content"
              value={content}
              onChange={onChange}
              placeholder="Enter your message"
              rows="6"
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Target Audience
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="both"
                  name="targetAudience"
                  type="radio"
                  value="both"
                  checked={targetAudience === "both"}
                  onChange={onChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label
                  htmlFor="both"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Both Students & Teachers
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="students"
                  name="targetAudience"
                  type="radio"
                  value="students"
                  checked={targetAudience === "students"}
                  onChange={onChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label
                  htmlFor="students"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Students Only
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="teachers"
                  name="targetAudience"
                  type="radio"
                  value="teachers"
                  checked={targetAudience === "teachers"}
                  onChange={onChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label
                  htmlFor="teachers"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Teachers Only
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>

      {/* Sent Messages Section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sent Messages</h2>
          <button
            onClick={fetchSentMessages}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center"
            disabled={loadingMessages}
          >
            {loadingMessages ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loadingMessages ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        ) : sentMessages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No messages have been sent yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sentMessages.map((message) => (
              <div
                key={message._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{message.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </span>
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete message"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getTargetAudienceDisplay(message.targetAudience)}
                  </span>
                </div>

                <div className="mt-3 text-gray-700">
                  <p>{message.content}</p>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  <p>
                    Read by: {message.readBy ? message.readBy.length : 0} users
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

     
    </div>
  );
};

export default SendMessage;
