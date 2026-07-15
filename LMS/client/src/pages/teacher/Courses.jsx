import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useSelector((state) => state.auth);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materialModal, setMaterialModal] = useState(false);
  const [materialType, setMaterialType] = useState("file");
  const [materialData, setMaterialData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    messageContent: "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expandedCourses, setExpandedCourses] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        console.log("Fetching courses for teacher:", user?._id);
        const response = await axios.get(
          "http://localhost:5000/api/courses",
          config
        );

        console.log("API response:", response.data);

        // Filter courses where this teacher is the instructor
        let teacherCourses = [];
        if (response.data.data && Array.isArray(response.data.data)) {
          teacherCourses = response.data.data.filter((course) => {
            // Check if instructor is a string (ID) or an object
            const instructorId =
              typeof course.instructor === "object"
                ? course.instructor._id
                : course.instructor;

            // Compare with the logged-in teacher's ID
            const isInstructor = instructorId === user._id;
            console.log(
              `Course ${course.title}: instructor=${instructorId}, user=${user._id}, match=${isInstructor}`
            );
            return isInstructor;
          });
        }

        console.log("Filtered teacher courses:", teacherCourses);
        setCourses(teacherCourses);

        // Initialize expanded state
        const initialExpandedState = {};
        teacherCourses.forEach((course) => {
          initialExpandedState[course._id] = false;
        });
        setExpandedCourses(initialExpandedState);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(
          error.response?.data?.error ||
            "An error occurred while fetching courses"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchCourses();
    } else {
      setLoading(false);
      setError("Please log in to view your courses");
    }
  }, [user, token]);

  const handleInputChange = (e) => {
    setMaterialData({
      ...materialData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleMaterialTypeChange = (type) => {
    setMaterialType(type);
    if (type === "message") {
      setUploadedFile(null);
    }
  };

  const handleAddMaterial = async (courseId) => {
    setSelectedCourse(courseId);
    setMaterialModal(true);
  };

  const closeMaterialModal = () => {
    setMaterialModal(false);
    setMaterialData({
      title: "",
      description: "",
      fileUrl: "",
      messageContent: "",
    });
    setUploadedFile(null);
    setUploadProgress(0);
  };

  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const submitMaterial = async (e) => {
    e.preventDefault();

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      let finalMaterialData = {
        ...materialData,
        type: materialType,
      };

      // Handle file upload if a file was selected
      if (materialType === "file" && uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);

        // Replace with your actual file upload endpoint
        const uploadResponse = await axios.post(
          "http://localhost:5000/api/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          }
        );

        finalMaterialData.fileUrl = uploadResponse.data.fileUrl;
      }

      await axios.post(
        `http://localhost:5000/api/courses/${selectedCourse}/materials`,
        finalMaterialData,
        config
      );

      // Refresh courses data
      const coursesResponse = await axios.get(
        "http://localhost:5000/api/courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let teacherCourses = [];
      if (
        coursesResponse.data.data &&
        Array.isArray(coursesResponse.data.data)
      ) {
        teacherCourses = coursesResponse.data.data.filter((course) => {
          const instructorId =
            typeof course.instructor === "object"
              ? course.instructor._id
              : course.instructor;
          return instructorId === user._id;
        });
      }

      setCourses(teacherCourses);
      closeMaterialModal();
    } catch (error) {
      console.error("Error adding material:", error);
      setError(
        error.response?.data?.error || "An error occurred while adding material"
      );
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
      <h1 className="text-2xl font-bold mb-6">My Teaching Courses</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">
            You don't have any assigned courses yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div
                className="bg-blue-50 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleCourseExpansion(course._id)}
              >
                <div>
                  <h2 className="text-xl font-bold text-blue-800">
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-500">{course.code}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm mr-3">
                    <span className="font-medium">
                      {course.students?.length || 0}
                    </span>{" "}
                    students
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                      expandedCourses[course._id] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {expandedCourses[course._id] && (
                <>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{course.description}</p>

                    {/* Course Materials Section */}
                    <div className="mt-6 mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">
                          Course Materials
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddMaterial(course._id);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                        >
                          Add Material
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        {course.materials && course.materials.length > 0 ? (
                          <div className="space-y-3 divide-y divide-gray-200">
                            {course.materials.map((material, idx) => (
                              <div key={idx} className="pt-3 first:pt-0">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="font-medium">
                                      {material.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {material.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {material.type !== "message" &&
                                      material.fileUrl && (
                                        <>
                                          <a
                                            href={material.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            View
                                          </a>
                                          <a
                                            href={material.fileUrl}
                                            download
                                            className="text-green-600 hover:text-green-800 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            Download
                                          </a>
                                        </>
                                      )}
                                  </div>
                                </div>
                                {material.messageContent && (
                                  <div className="mt-2 bg-white p-3 rounded border border-gray-200 text-sm">
                                    {material.messageContent}
                                  </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Added:{" "}
                                  {new Date(
                                    material.uploadedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-2">
                            No materials added yet
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Students</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {course.students && course.students.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm font-medium text-gray-500 px-2">
                              <span>Name</span>
                              <span>ID</span>
                            </div>
                            <div className="divide-y divide-gray-200">
                              {Array.isArray(course.students) &&
                                course.students.map((student, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between py-2 px-2"
                                  >
                                    <span className="text-sm">
                                      {typeof student === "object"
                                        ? student.name
                                        : "Unknown"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {typeof student === "object"
                                        ? student.uniqueId
                                        : "Unknown"}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-2">
                            No students enrolled
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Course Code:</span>{" "}
                      {course.code}
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddMaterial(course._id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                      >
                        Add Materials
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors">
                        Manage Course
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Material Upload Modal */}
      {materialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div
            className="bg-white rounded-lg w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Course Material</h3>
              <button
                onClick={closeMaterialModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form onSubmit={submitMaterial}>
              <div className="mb-4">
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handleMaterialTypeChange("file")}
                    className={`flex-1 py-2 px-4 rounded-md ${
                      materialType === "file"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMaterialTypeChange("message")}
                    className={`flex-1 py-2 px-4 rounded-md ${
                      materialType === "message"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMaterialTypeChange("link")}
                    className={`flex-1 py-2 px-4 rounded-md ${
                      materialType === "link"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Add Link
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={materialData.title}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={materialData.description}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                {materialType === "file" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Upload File
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {materialType === "link" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      name="fileUrl"
                      value={materialData.fileUrl}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="https://"
                      required
                    />
                  </div>
                )}

                {materialType === "message" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Message
                    </label>
                    <textarea
                      name="messageContent"
                      value={materialData.messageContent}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="4"
                      required
                    ></textarea>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeMaterialModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debug info */}
      <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
        <h3 className="text-sm font-bold mb-2">Debug Information:</h3>
        <div className="text-xs font-mono whitespace-pre-wrap">
          <p>User ID: {user?._id || "Not available"}</p>
          <p>User Role: {user?.role || "Not available"}</p>
          <p>Token available: {token ? "Yes" : "No"}</p>
          <p>Courses count: {courses.length}</p>
          <p>Course IDs: {courses.map((c) => c._id).join(", ")}</p>
        </div>
      </div>
      
    </div>
  );
};

export default TeacherCourses;
