import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import React from "react";

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([
    { id: "class-a", name: "Class A" },
    { id: "class-b", name: "Class B" },
    { id: "class-c", name: "Class C" },
  ]);
  const [selectedClasses, setSelectedClasses] = useState({});
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          "http://localhost:5000/api/users/pending",
          config
        );
        setPendingUsers(response.data.data);

        // Initialize selected classes for each student
        const initialSelectedClasses = {};
        response.data.data.forEach((user) => {
          if (user.role === "student") {
            initialSelectedClasses[user._id] = "class-a"; // Default class
          }
        });
        setSelectedClasses(initialSelectedClasses);
      } catch (error) {
        setError("Error fetching pending users");
        console.error("Error fetching pending users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, [token]);

  const handleClassChange = (userId, classId) => {
    setSelectedClasses({
      ...selectedClasses,
      [userId]: classId,
    });
  };

  const initiateApproval = (user) => {
    setSelectedUser(user);
    if (user.role === "student") {
      setShowApproveModal(true);
    } else {
      approveUser(user._id);
    }
  };

  const approveUser = async (userId, classId = null) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // First approve the user
      await axios.put(
        `http://localhost:5000/api/users/${userId}/approve`,
        {},
        config
      );

      // If it's a student and class is selected, store the class assignment
      if (classId) {
        // In a real app, you'd have a proper API endpoint to assign a class
        // For now, we'll just store it in localStorage for demonstration
        const studentClasses = JSON.parse(
          localStorage.getItem("studentClasses") || "{}"
        );
        studentClasses[userId] = classId;
        localStorage.setItem("studentClasses", JSON.stringify(studentClasses));
        console.log(`Student ${userId} assigned to class ${classId}`);
      }

      // Close modal if open
      setShowApproveModal(false);
      setSelectedUser(null);

      // Remove approved user from the list
      setPendingUsers(pendingUsers.filter((user) => user._id !== userId));
    } catch (error) {
      setError("Error approving user");
      console.error("Error approving user:", error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(`http://localhost:5000/api/users/${userId}`, config);

        // Remove deleted user from the list
        setPendingUsers(pendingUsers.filter((user) => user._id !== userId));
      } catch (error) {
        setError("Error deleting user");
        console.error("Error deleting user:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>

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
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
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

      {pendingUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p className="text-gray-500">No pending approvals at this time</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Registered On
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Class
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "student"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.uniqueId || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.registeredOn).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === "student" && (
                      <select
                        value={selectedClasses[user._id] || ""}
                        onChange={(e) =>
                          handleClassChange(user._id, e.target.value)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => initiateApproval(user)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approval Confirmation Modal for Students */}
      {showApproveModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 text-teal-700 border-b pb-2">
                Approve Student
              </h3>
              <p className="mb-4">
                You are about to approve <strong>{selectedUser.name}</strong> as
                a student. Please confirm the class assignment:
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Class:
                </label>
                <select
                  value={selectedClasses[selectedUser._id] || ""}
                  onChange={(e) =>
                    handleClassChange(selectedUser._id, e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedUser(null);
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    approveUser(
                      selectedUser._id,
                      selectedClasses[selectedUser._id]
                    )
                  }
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                >
                  Approve & Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
