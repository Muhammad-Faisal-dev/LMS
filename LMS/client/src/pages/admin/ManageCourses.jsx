import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    instructor: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // First fetch teachers so we have them available when processing courses
        await fetchTeachers();

        // Then fetch courses
        await fetchCourses();

        // Finally generate class data and fetch students
        await generateClasses();
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError(
          "Failed to load necessary data. Please try refreshing the page."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadInitialData();
    } else {
      setError("Authentication required");
      setLoading(false);
    }
  }, [token]);

  const fetchCourses = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        "http://localhost:5000/api/courses",
        config
      );

      console.log("Courses fetched:", response.data);

      // If instructor is populated as an ID instead of an object, fetch instructor details
      const coursesData = response.data.data || [];

      // For each course, ensure instructor data is properly populated
      const coursesWithInstructors = await Promise.all(
        coursesData.map(async (course) => {
          // If instructor is just an ID and not an object with name
          if (course.instructor && typeof course.instructor === "string") {
            try {
              // First check if we already have this teacher in our local state
              const cachedTeacher = teachers.find(
                (t) => t._id === course.instructor
              );
              if (cachedTeacher) {
                console.log(
                  `Using cached teacher for course ${course.title}:`,
                  cachedTeacher.name
                );
                return {
                  ...course,
                  instructor: cachedTeacher,
                };
              }

              // Otherwise fetch from the API
              console.log(
                `Fetching instructor ${course.instructor} for course ${course.title}`
              );
              const instructorResponse = await axios.get(
                `http://localhost:5000/api/users/${course.instructor}`,
                config
              );
              if (instructorResponse.data.success) {
                console.log(
                  `Got instructor for course ${course.title}:`,
                  instructorResponse.data.data.name
                );
                return {
                  ...course,
                  instructor: instructorResponse.data.data,
                };
              }
            } catch (err) {
              console.error(
                `Error fetching instructor for course ${course._id}:`,
                err
              );
            }
          } else if (
            course.instructor &&
            typeof course.instructor === "object"
          ) {
            console.log(
              `Course ${course.title} already has instructor object:`,
              course.instructor.name
            );
          } else {
            console.log(`Course ${course.title} has no instructor`);
          }
          return course;
        })
      );

      console.log("Processed courses:", coursesWithInstructors);
      setCourses(coursesWithInstructors);
      return response.data;
    } catch (error) {
      setError("Error fetching courses");
      console.error("Error fetching courses:", error);
      throw error;
    }
  };

  const fetchTeachers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log("Fetching teachers...");
      const response = await axios.get(
        "http://localhost:5000/api/users?role=teacher",
        config
      );
      console.log("Teachers response:", response.data);

      // Filter to ensure we only get users with teacher role
      const teachersOnly = response.data.data
        ? response.data.data.filter((user) => user.role === "teacher")
        : [];

      console.log("Filtered teachers:", teachersOnly);
      setTeachers(teachersOnly);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log("Fetching students...");
      const response = await axios.get(
        "http://localhost:5000/api/users?role=student",
        config
      );

      // Filter to ensure we only get users with student role who are approved
      const studentsOnly = response.data.data
        ? response.data.data.filter(
            (user) => user.role === "student" && user.isApproved === true
          )
        : [];

      console.log("Filtered students:", studentsOnly);
      setStudents(studentsOnly);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // For demo purposes, we'll create some sample classes
  const generateClasses = async () => {
    try {
      console.log("Generating classes and fetching students...");
      const demoClasses = [
        { id: "class-a", name: "Class A" },
        { id: "class-b", name: "Class B" },
        { id: "class-c", name: "Class C" },
      ];
      setClasses(demoClasses);
      await fetchStudents();
    } catch (error) {
      console.error("Error in generateClasses:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // New function to refresh all data completely
  const refreshAllData = async () => {
    setLoading(true);
    try {
      console.log("Refreshing all course data...");
      // First refetch all teachers to ensure our data is fresh
      await fetchTeachers();
      // Then fetch courses to get updated list
      await fetchCourses();
      console.log("Data refresh complete");
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      console.log("Adding course with data:", formData);

      // Ensure we're using the correct instructor ID
      if (!formData.instructor) {
        setError("Please select a teacher for this course");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Find the teacher object to confirm we have the right data
      const selectedTeacher = teachers.find(
        (t) => t._id === formData.instructor
      );
      if (!selectedTeacher) {
        setError("Selected teacher not found. Please try again.");
        return;
      }

      console.log("Selected teacher:", selectedTeacher);

      // Create the request payload with explicit instructor field
      const courseData = {
        ...formData,
        instructor: selectedTeacher._id, // Explicitly set the instructor ID
      };

      console.log("Sending course data:", courseData);

      const response = await axios.post(
        "http://localhost:5000/api/courses",
        courseData,
        config
      );

      console.log("Course creation response:", response.data);

      if (response.data.success) {
        // Verify the instructor was set correctly
        const createdCourse = response.data.data;
        console.log("Created course:", createdCourse);

        if (
          createdCourse.instructor &&
          typeof createdCourse.instructor === "object" &&
          createdCourse.instructor._id === selectedTeacher._id
        ) {
          console.log(
            "Instructor set correctly to:",
            createdCourse.instructor.name
          );
        } else {
          console.warn(
            "Instructor might not be set correctly:",
            createdCourse.instructor
          );
        }

        setFormData({
          title: "",
          code: "",
          description: "",
          instructor: "",
        });
        setShowAddModal(false);

        // Refresh all data with a small delay to ensure server has updated
        setTimeout(() => {
          refreshAllData();
        }, 500);
      }
    } catch (error) {
      console.error("Error adding course:", error);
      setError(error.response?.data?.error || "Error adding course");
    }
  };

  const handleAssignToClass = async () => {
    try {
      if (!selectedCourse) {
        setError("No course selected");
        return;
      }

      if (!selectedClass) {
        setError("No class selected");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Get class assignments from localStorage (in a real app, this would come from the database)
      const studentClasses = JSON.parse(
        localStorage.getItem("studentClasses") || "{}"
      );

      // Get students for this class
      const classStudents = students.filter((student) => {
        // Check if student is assigned to the selected class
        return studentClasses[student._id] === selectedClass;
      });

      console.log(
        `Found ${classStudents.length} students in class ${selectedClass}`
      );

      if (classStudents.length === 0) {
        setError(
          "No students found in this class. Please assign students to classes first."
        );
        return;
      }

      // Enroll each student in the course
      let enrolledCount = 0;
      for (const student of classStudents) {
        try {
          console.log(
            `Enrolling student ${student._id} (${student.name}) in course ${selectedCourse}`
          );
          await axios.post(
            `http://localhost:5000/api/courses/${selectedCourse}/enroll`,
            { studentId: student._id },
            config
          );
          enrolledCount++;
        } catch (enrollError) {
          console.error(`Error enrolling student ${student._id}:`, enrollError);
        }
      }

      if (enrolledCount > 0) {
        console.log(`Successfully enrolled ${enrolledCount} students`);
        setShowAssignModal(false);
        setSelectedCourse(null);
        setSelectedClass("");
        fetchCourses();
      } else {
        setError(
          "Failed to enroll any students. Please check the console for details."
        );
      }
    } catch (error) {
      console.error("Error assigning course to class:", error);
      setError(error.response?.data?.error || "Error assigning course");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(
          `http://localhost:5000/api/courses/${courseId}`,
          config
        );

        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        setError("Error deleting course");
      }
    }
  };

  // In the table row where instructor name is displayed
  // Add a debugging helper to see what's happening with the instructor data
  const getInstructorName = (course) => {
    if (!course.instructor) {
      return "Unassigned";
    }

    if (typeof course.instructor === "object" && course.instructor.name) {
      console.log(
        `Course ${course.title}: Instructor is object with name ${course.instructor.name}`
      );
      return course.instructor.name;
    } else if (typeof course.instructor === "string") {
      console.log(
        `Course ${course.title}: Instructor is string ID ${course.instructor}`
      );
      const teacher = teachers.find((t) => t._id === course.instructor);
      return teacher ? teacher.name : "Unknown";
    } else {
      console.log(
        `Course ${course.title}: Instructor format unknown`,
        course.instructor
      );
      return "Unknown";
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
      <h1 className="text-2xl font-bold mb-6">Manage Courses</h1>

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

      {/* Add Course Button */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-md shadow-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Course
        </button>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Course Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Course Code
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Instructor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Enrolled Students
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
            {courses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No courses found
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {course.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{course.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {getInstructorName(course)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.students?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedCourse(course._id);
                        setShowAssignModal(true);
                      }}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Assign to Class
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 text-teal-700 border-b pb-2">
                Add New Course
              </h3>
              {teachers.length === 0 && (
                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-yellow-700">
                    Loading teachers... If no teachers appear, please make sure
                    there are approved teachers in the system.
                  </p>
                </div>
              )}
              <form onSubmit={handleAddCourse}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Assign Teacher
                  </label>
                  <select
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                  >
                    Save Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Course to Class Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                Assign Course to Class
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToClass}
                  disabled={!selectedClass}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Assign to Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
