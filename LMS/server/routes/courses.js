const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private/Teacher
router.post("/", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { title, code, description, instructor } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: "Course code already exists",
      });
    }

    // For admin users, allow setting a different instructor
    // For teachers, they can only create courses where they are the instructor
    const instructorId =
      req.user.role === "admin" && instructor ? instructor : req.user.id;

    // Verify that the instructor exists and is a teacher
    if (req.user.role === "admin" && instructor) {
      const teacherExists = await User.findOne({
        _id: instructor,
        role: "teacher",
      });
      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          error: "Selected teacher does not exist",
        });
      }
    }

    console.log(
      `Creating course with instructor: ${instructorId} (set by ${req.user.role})`
    );

    const course = await Course.create({
      title,
      code,
      description,
      instructor: instructorId,
    });

    // Populate the instructor information before sending response
    const populatedCourse = await Course.findById(course._id).populate(
      "instructor",
      "name uniqueId"
    );

    res.status(201).json({
      success: true,
      data: populatedCourse,
    });
  } catch (error) {
    console.error("Course creation error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/courses
// @desc    Get all courses (filtered by role)
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    let courses = [];

    console.log(
      `User ${req.user.name} (${req.user.id}, role: ${req.user.role}) fetching courses`
    );

    if (req.user.role === "admin") {
      // Admin can see all courses
      courses = await Course.find()
        .populate("instructor", "name uniqueId role")
        .populate("students", "name uniqueId role")
        .sort({ createdAt: -1 });
      console.log(`Admin found ${courses.length} total courses`);
    } else if (req.user.role === "teacher") {
      // Teacher can see only their courses
      courses = await Course.find({ instructor: req.user.id })
        .populate("instructor", "name uniqueId role")
        .populate("students", "name uniqueId role")
        .sort({ createdAt: -1 });
      console.log(
        `Found ${courses.length} courses for teacher ${req.user.name} (${req.user.id})`
      );

      // Log instructor details for debugging
      courses.forEach((course) => {
        console.log(
          `Course: ${course.title}, Instructor: ${
            course.instructor
              ? typeof course.instructor === "object"
                ? `${course.instructor.name} (${course.instructor._id})`
                : course.instructor
              : "None"
          }`
        );
      });
    } else if (req.user.role === "student") {
      // Student can see courses they are enrolled in
      courses = await Course.find({ students: req.user.id })
        .populate("instructor", "name uniqueId role")
        .populate("students", "name uniqueId role")
        .sort({ createdAt: -1 });
      console.log(
        `Found ${courses.length} courses for student ${req.user.name}`
      );
    }

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name uniqueId role")
      .populate("students", "name uniqueId");

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check if user has access to this course
    if (
      req.user.role === "student" &&
      !course.students.some((student) => student._id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this course",
      });
    }

    if (
      req.user.role === "teacher" &&
      course.instructor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this course",
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private/Teacher (course owner)
router.put("/:id", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Make sure user is course instructor or admin
    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this course",
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll a student in a course
// @access  Private/Admin or Teacher (course owner)
router.post(
  "/:id/enroll",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { studentId } = req.body;

      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      // Make sure user is course instructor or admin
      if (
        req.user.role !== "admin" &&
        course.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to enroll students in this course",
        });
      }

      // Check if student exists and is approved
      const student = await User.findOne({
        _id: studentId,
        role: "student",
        isApproved: true,
      });
      if (!student) {
        return res.status(404).json({
          success: false,
          error: "Student not found or not approved",
        });
      }

      // Check if student is already enrolled
      if (course.students.includes(studentId)) {
        return res.status(400).json({
          success: false,
          error: "Student is already enrolled in this course",
        });
      }

      // Add student to course
      course.students.push(studentId);
      await course.save();

      res.json({
        success: true,
        message: "Student enrolled successfully",
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// @route   POST /api/courses/:id/unenroll
// @desc    Remove a student from a course
// @access  Private/Admin or Teacher (course owner)
router.post(
  "/:id/unenroll",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { studentId } = req.body;

      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      // Make sure user is course instructor or admin
      if (
        req.user.role !== "admin" &&
        course.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to remove students from this course",
        });
      }

      // Check if student is enrolled
      if (!course.students.includes(studentId)) {
        return res.status(400).json({
          success: false,
          error: "Student is not enrolled in this course",
        });
      }

      // Remove student from course
      course.students = course.students.filter(
        (student) => student.toString() !== studentId
      );
      await course.save();

      res.json({
        success: true,
        message: "Student removed successfully",
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private/Admin or Teacher (course owner)
router.delete(
  "/:id",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      // Make sure user is course instructor or admin
      if (
        req.user.role !== "admin" &&
        course.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to delete this course",
        });
      }

      await course.deleteOne();

      res.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// @route   POST /api/courses/:id/materials
// @desc    Add material to a course
// @access  Private/Teacher (course owner)
router.post(
  "/:id/materials",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { title, description, fileUrl, messageContent } = req.body;

      // Find course
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      // Make sure user is course instructor or admin
      if (
        req.user.role !== "admin" &&
        course.instructor.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to add materials to this course",
        });
      }

      // Create material object
      const materialData = {
        title,
        description,
        uploadedAt: Date.now(),
      };

      // Handle file URL if provided
      if (fileUrl) {
        materialData.fileUrl = fileUrl;
      }

      // Handle message content if provided
      if (messageContent) {
        materialData.messageContent = messageContent;
      }

      // Add material to course
      course.materials.push(materialData);
      await course.save();

      // Return the updated course with populated fields
      const updatedCourse = await Course.findById(req.params.id)
        .populate("instructor", "name uniqueId role")
        .populate("students", "name uniqueId");

      res.status(201).json({
        success: true,
        data: updatedCourse,
      });
    } catch (error) {
      console.error("Error adding material:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

module.exports = router;
