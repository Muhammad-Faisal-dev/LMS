const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Submission = require("../models/Submission");
const User = require("../models/User");
const Progress = require("../models/Progress");
const { protect } = require("../middleware/auth");

router.get("/overview", protect, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const [users, courses, messages, submissions, notifications] = await Promise.all([
        User.find().select("role cohort isApproved"),
        Course.find().select("students assignments materials"),
        Message.find().select("targetAudience readBy"),
        Submission.find().select("status grade"),
        Notification.countDocuments({ recipient: req.user.id, isRead: false }),
      ]);

      const usersByRole = {
        admin: users.filter((user) => user.role === "admin").length,
        teacher: users.filter((user) => user.role === "teacher").length,
        student: users.filter((user) => user.role === "student").length,
      };

      const cohorts = users
        .filter((user) => user.role === "student" && user.cohort)
        .reduce((acc, user) => {
          acc[user.cohort] = (acc[user.cohort] || 0) + 1;
          return acc;
        }, {});

      const totalEnrollments = courses.reduce(
        (sum, course) => sum + (course.students?.length || 0),
        0
      );

      return res.json({
        success: true,
        data: {
          usersByRole,
          pendingUsers: users.filter((user) => !user.isApproved).length,
          cohorts,
          totalCourses: courses.length,
          totalEnrollments,
          totalAssignments: courses.reduce(
            (sum, course) => sum + (course.assignments?.length || 0),
            0
          ),
          totalMaterials: courses.reduce(
            (sum, course) => sum + (course.materials?.length || 0),
            0
          ),
          totalMessages: messages.length,
          totalSubmissions: submissions.length,
          gradedSubmissions: submissions.filter((item) => item.status === "graded").length,
          unreadNotifications: notifications,
        },
      });
    }

    if (req.user.role === "teacher") {
      const courses = await Course.find({ instructor: req.user.id }).select(
        "title code students assignments materials"
      );
      const submissions = await Submission.find({
        course: { $in: courses.map((course) => course._id) },
      }).select("assignmentId status grade");
      const notifications = await Notification.countDocuments({
        recipient: req.user.id,
        isRead: false,
      });

      return res.json({
        success: true,
        data: {
          totalCourses: courses.length,
          totalStudents: courses.reduce(
            (sum, course) => sum + (course.students?.length || 0),
            0
          ),
          totalAssignments: courses.reduce(
            (sum, course) => sum + (course.assignments?.length || 0),
            0
          ),
          totalMaterials: courses.reduce(
            (sum, course) => sum + (course.materials?.length || 0),
            0
          ),
          totalSubmissions: submissions.length,
          gradedSubmissions: submissions.filter((item) => item.status === "graded").length,
          unreadNotifications: notifications,
          courses: courses.map((course) => ({
            title: course.title,
            code: course.code,
            students: course.students?.length || 0,
            assignments: course.assignments?.length || 0,
          })),
        },
      });
    }

    const [courses, submissions, notifications, progressDocs] = await Promise.all([
      Course.find({ students: req.user.id }).select("title code materials assignments"),
      Submission.find({ student: req.user.id }).select("status grade assignmentTitle"),
      Notification.countDocuments({ recipient: req.user.id, isRead: false }),
      Progress.find({ student: req.user.id }).select("course completedMaterials"),
    ]);

    const completedMaterials = progressDocs.reduce(
      (sum, progress) => sum + (progress.completedMaterials?.length || 0),
      0
    );

    return res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalMaterials: courses.reduce(
          (sum, course) => sum + (course.materials?.length || 0),
          0
        ),
        completedMaterials,
        totalAssignments: courses.reduce(
          (sum, course) => sum + (course.assignments?.length || 0),
          0
        ),
        submittedAssignments: submissions.length,
        gradedAssignments: submissions.filter((item) => item.status === "graded").length,
        unreadNotifications: notifications,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
