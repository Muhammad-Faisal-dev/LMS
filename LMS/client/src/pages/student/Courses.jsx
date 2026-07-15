import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useSelector((state) => state.auth);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewMaterials, setViewMaterials] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          "http://localhost:5000/api/courses",
          config
        );

        setCourses(response.data.data || []);
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

  const handleViewCourse = (courseId) => {
    setSelectedCourse(courses.find((course) => course._id === courseId));
    setViewMaterials(true);
  };

  const backToCourses = () => {
    setSelectedCourse(null);
    setViewMaterials(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (viewMaterials && selectedCourse) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <button
            onClick={backToCourses}
            className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back to Courses
          </button>
          <h1 className="text-2xl font-bold">{selectedCourse.title}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
          <div className="bg-blue-50 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-blue-800">
                  {selectedCourse.title}
                </h2>
                <p className="text-sm text-gray-500">{selectedCourse.code}</p>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Instructor: </span>
                {selectedCourse.instructor?.name}
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">{selectedCourse.description}</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Course Materials</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {selectedCourse.materials &&
                selectedCourse.materials.length > 0 ? (
                  <div className="space-y-3 divide-y divide-gray-200">
                    {selectedCourse.materials.map((material, idx) => (
                      <div key={idx} className="pt-3 first:pt-0">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{material.title}</h4>
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
                                  >
                                    View
                                  </a>
                                  <a
                                    href={material.fileUrl}
                                    download
                                    className="text-green-600 hover:text-green-800 text-sm"
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
                          {new Date(material.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-2">
                    No materials available for this course
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">
            You are not enrolled in any courses yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-primary-50 p-4">
                <h2 className="text-lg font-bold text-primary-800">
                  {course.title}
                </h2>
                <p className="text-sm text-gray-500">{course.code}</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  {course.description}
                </p>
                <div className="flex items-center mb-2">
                  <svg
                    className="h-5 w-5 text-primary-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  <span className="text-sm">
                    Instructor: {course.instructor?.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-primary-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    ></path>
                  </svg>
                  <span className="text-sm">
                    {course.materials?.length || 0} Materials
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <button
                  onClick={() => handleViewCourse(course._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                >
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      
    </div>
  );
};

export default StudentCourses;
