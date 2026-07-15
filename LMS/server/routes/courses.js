const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const User = require("../models/User");
const Submission = require("../models/Submission");
const { protect, authorize } = require("../middleware/auth");
const {
  createNotificationForUser,
  createNotificationsForUsers,
} = require("../utils/notifications");

const isCourseManager = (course, user) =>
  user.role === "admin" || course.instructor.toString() === user.id;

const getPopulatedCourse = (id) =>
  Course.findById(id)
    .populate("instructor", "name uniqueId role")
    .populate("students", "name uniqueId role cohort");

const getAssignment = (course, assignmentId) =>
  course.assignments.id(assignmentId) ||
  course.assignments.find((assignment) => assignment._id.toString() === assignmentId);

router.post("/", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const { title, code, description, instructor } = req.body;

    if (!title || !code || !description) {
      return res.status(400).json({
        success: false,
        error: "Please provide title, code and description",
      });
    }

    const normalizedCode = code.trim().toUpperCase();
    const existingCourse = await Course.findOne({ code: normalizedCode });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: "Course code already exists",
      });
    }

    const instructorId =
      req.user.role === "admin" && instructor ? instructor : req.user.id;

    const teacherExists = await User.findOne({
      _id: instructorId,
      role: "teacher",
      isApproved: true,
    });

    if (!teacherExists) {
      return res.status(400).json({
        success: false,
        error: "Selected teacher does not exist or is not approved",
      });
    }

    const course = await Course.create({
      title: title.trim(),
      code: normalizedCode,
      description: description.trim(),
      instructor: instructorId,
    });

    if (req.user.role === "admin") {
      await createNotificationForUser({
        recipient: instructorId,
        title: "New course assigned",
        message: `You have been assigned to teach ${title.trim()} (${normalizedCode}).`,
        type: "course",
        link: "/teacher/courses",
        metadata: { courseId: course._id },
      });
    }

    const populatedCourse = await getPopulatedCourse(course._id);

    return res.status(201).json({
      success: true,
      data: populatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "teacher") {
      query = { instructor: req.user.id };
    }

    if (req.user.role === "student") {
      query = { students: req.user.id };
    }

    const courses = await Course.find(query)
      .populate("instructor", "name uniqueId role")
      .populate("students", "name uniqueId role cohort")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const course = await getPopulatedCourse(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

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

    return res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/:id", protect, authorize("teacher", "admin"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    if (!isCourseManager(course, req.user)) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this course",
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(req.body.title && { title: req.body.title.trim() }),
        ...(req.body.code && { code: req.body.code.trim().toUpperCase() }),
        ...(req.body.description && { description: req.body.description.trim() }),
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("instructor", "name uniqueId role")
      .populate("students", "name uniqueId role cohort");

    return res.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

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

      if (!isCourseManager(course, req.user)) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to enroll students in this course",
        });
      }

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

      if (course.students.some((studentItem) => studentItem.toString() === studentId)) {
        return res.status(400).json({
          success: false,
          error: "Student is already enrolled in this course",
        });
      }

      course.students.push(studentId);
      await course.save();

      await createNotificationForUser({
        recipient: studentId,
        title: "New course enrollment",
        message: `You were enrolled in ${course.title}.`,
        type: "course",
        link: "/student/courses",
        metadata: { courseId: course._id },
      });

      const updatedCourse = await getPopulatedCourse(course._id);

      return res.json({
        success: true,
        message: "Student enrolled successfully",
        data: updatedCourse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

router.post(
  "/:id/enroll-cohort",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { cohort } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (!isCourseManager(course, req.user)) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to enroll students in this course",
        });
      }

      if (!cohort || !cohort.trim()) {
        return res.status(400).json({
          success: false,
          error: "Please select a cohort",
        });
      }

      const students = await User.find({
        role: "student",
        isApproved: true,
        cohort: cohort.trim(),
      }).select("_id");

      if (!students.length) {
        return res.status(404).json({
          success: false,
          error: "No approved students found in this cohort",
        });
      }

      const existingIds = new Set(course.students.map((student) => student.toString()));
      const addedRecipients = [];
      let added = 0;

      students.forEach((student) => {
        const id = student._id.toString();
        if (!existingIds.has(id)) {
          course.students.push(student._id);
          existingIds.add(id);
          addedRecipients.push(student._id);
          added += 1;
        }
      });

      await course.save();

      if (addedRecipients.length) {
        await createNotificationsForUsers({
          recipients: addedRecipients,
          title: "Course enrollment",
          message: `You were enrolled in ${course.title} through cohort ${cohort.trim()}.`,
          type: "course",
          link: "/student/courses",
          metadata: { courseId: course._id, cohort: cohort.trim() },
        });
      }

      const updatedCourse = await getPopulatedCourse(course._id);

      return res.json({
        success: true,
        message:
          added > 0
            ? `${added} students enrolled from ${cohort}`
            : `All students from ${cohort} are already enrolled`,
        data: updatedCourse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

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

      if (!isCourseManager(course, req.user)) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to remove students from this course",
        });
      }

      const isEnrolled = course.students.some(
        (student) => student.toString() === studentId
      );

      if (!isEnrolled) {
        return res.status(400).json({
          success: false,
          error: "Student is not enrolled in this course",
        });
      }

      course.students = course.students.filter(
        (student) => student.toString() !== studentId
      );
      await course.save();

      const updatedCourse = await getPopulatedCourse(course._id);

      return res.json({
        success: true,
        message: "Student removed successfully",
        data: updatedCourse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

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

      if (!isCourseManager(course, req.user)) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to delete this course",
        });
      }

      await Submission.deleteMany({ course: course._id });
      await course.deleteOne();

      return res.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

router.post(
  "/:id/materials",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { title, description, fileUrl, messageContent, type = "file" } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (!isCourseManager(course, req.user)) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to add materials to this course",
        });
      }

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          error: "Material title is required",
        });
      }

      const materialData = {
        title: title.trim(),
        description: description?.trim() || "",
        type,
        uploadedAt: Date.now(),
      };

      if (fileUrl) {
        materialData.fileUrl = fileUrl;
      }

      if (messageContent) {
        materialData.messageContent = messageContent.trim();
      }

      course.materials.push(materialData);
      await course.save();

      if (course.students.length) {
        await createNotificationsForUsers({
          recipients: course.students,
          title: "New course material",
          message: `${title.trim()} was added to ${course.title}.`,
          type: "course",
          link: "/student/courses",
          metadata: { courseId: course._id },
        });
      }

      const updatedCourse = await getPopulatedCourse(req.params.id);

      return res.status(201).json({
        success: true,
        data: updatedCourse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

router.post(
  "/:id/assignments",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { title, description, dueDate, totalPoints } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (!isCourseManager(course, req.user)) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to add assignments to this course",
        });
      }

      if (!title || !dueDate) {
        return res.status(400).json({
          success: false,
          error: "Assignment title and due date are required",
        });
      }

      course.assignments.push({
        title: title.trim(),
        description: description?.trim() || "",
        dueDate,
        totalPoints: Number(totalPoints) || 100,
      });

      await course.save();
      const newAssignment = course.assignments[course.assignments.length - 1];

      if (course.students.length) {
        await createNotificationsForUsers({
          recipients: course.students,
          title: "New assignment posted",
          message: `${title.trim()} was added in ${course.title}.`,
          type: "assignment",
          link: "/student/courses",
          metadata: { courseId: course._id, assignmentId: newAssignment._id },
        });
      }

      const updatedCourse = await getPopulatedCourse(req.params.id);

      return res.status(201).json({
        success: true,
        data: updatedCourse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

router.delete(
  "/:id/assignments/:assignmentId",
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

      if (!isCourseManager(course, req.user)) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to remove assignments from this course",
        });
      }

      const assignment = getAssignment(course, req.params.assignmentId);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: "Assignment not found",
        });
      }

      assignment.deleteOne();
      await course.save();
      await Submission.deleteMany({
        course: course._id,
        assignmentId: req.params.assignmentId,
      });

      const updatedCourse = await getPopulatedCourse(req.params.id);

      return res.json({
        success: true,
        message: "Assignment deleted successfully",
        data: updatedCourse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

module.exports = router;
