const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const Course = require("../models/Course");
const { protect, authorize } = require("../middleware/auth");
const {
  createNotificationForUser,
  createNotificationsForUsers,
} = require("../utils/notifications");

const canManageCourse = (course, user) =>
  user.role === "admin" || course.instructor.toString() === user.id;

const findAssignment = (course, assignmentId) =>
  course.assignments.id(assignmentId) ||
  course.assignments.find((assignment) => assignment._id.toString() === assignmentId);

router.get("/my", protect, authorize("student"), async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { student: req.user.id };

    if (courseId) {
      query.course = courseId;
    }

    const submissions = await Submission.find(query)
      .populate("course", "title code")
      .sort({ submittedAt: -1 });

    return res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get(
  "/course/:courseId",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (!canManageCourse(course, req.user)) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to view submissions for this course",
        });
      }

      const query = { course: course._id };
      if (req.query.assignmentId) {
        query.assignmentId = req.query.assignmentId;
      }

      const submissions = await Submission.find(query)
        .populate("student", "name email uniqueId cohort")
        .sort({ submittedAt: -1 });

      return res.json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

router.post("/", protect, authorize("student"), async (req, res) => {
  try {
    const { courseId, assignmentId, submissionText = "", attachmentUrl = "" } = req.body;

    if (!courseId || !assignmentId) {
      return res.status(400).json({
        success: false,
        error: "Course and assignment are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const isEnrolled = course.students.some(
      (student) => student.toString() === req.user.id
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        error: "You are not enrolled in this course",
      });
    }

    const assignment = findAssignment(course, assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    const submission = await Submission.findOneAndUpdate(
      {
        course: courseId,
        assignmentId,
        student: req.user.id,
      },
      {
        course: courseId,
        assignmentId,
        assignmentTitle: assignment.title,
        student: req.user.id,
        submissionText: submissionText.trim(),
        attachmentUrl: attachmentUrl.trim(),
        status: "submitted",
        submittedAt: new Date(),
        grade: null,
        feedback: "",
        gradedAt: null,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    )
      .populate("student", "name email uniqueId cohort")
      .populate("course", "title code instructor");

    const notifyRecipients = [course.instructor];
    await createNotificationsForUsers({
      recipients: notifyRecipients,
      title: "New assignment submission",
      message: `${req.user.name} submitted ${assignment.title} in ${course.title}.`,
      type: "submission",
      link: "/teacher/courses",
      metadata: {
        courseId: course._id,
        assignmentId,
        submissionId: submission._id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put(
  "/:id/grade",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { grade, feedback = "", status = "graded" } = req.body;
      const submission = await Submission.findById(req.params.id).populate("student", "name");

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: "Submission not found",
        });
      }

      const course = await Course.findById(submission.course);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (!canManageCourse(course, req.user)) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to grade submissions for this course",
        });
      }

      submission.grade = Number(grade);
      submission.feedback = feedback.trim();
      submission.status = status;
      submission.gradedAt = new Date();
      await submission.save();

      await createNotificationForUser({
        recipient: submission.student._id,
        title: "Assignment graded",
        message: `${submission.assignmentTitle} has been graded${
          Number.isFinite(Number(grade)) ? ` with ${grade} points` : ""
        }.`,
        type: "grade",
        link: "/student/courses",
        metadata: {
          courseId: course._id,
          assignmentId: submission.assignmentId,
          submissionId: submission._id,
        },
      });

      const updatedSubmission = await Submission.findById(submission._id)
        .populate("student", "name email uniqueId cohort")
        .populate("course", "title code");

      return res.json({
        success: true,
        message: "Submission graded successfully",
        data: updatedSubmission,
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
