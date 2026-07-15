const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Progress = require("../models/Progress");
const { protect, authorize } = require("../middleware/auth");

const ensureStudentAccess = async (courseId, userId) => {
  const course = await Course.findById(courseId).select("students materials title");

  if (!course) {
    return { error: "Course not found", status: 404 };
  }

  const enrolled = course.students.some((student) => student.toString() === userId);

  if (!enrolled) {
    return { error: "You are not enrolled in this course", status: 403 };
  }

  return { course };
};

router.get("/my", protect, authorize("student"), async (req, res) => {
  try {
    const query = { student: req.user.id };

    if (req.query.courseId) {
      query.course = req.query.courseId;
    }

    const progressDocs = await Progress.find(query).sort({ updatedAt: -1 });

    return res.json({
      success: true,
      count: progressDocs.length,
      data: progressDocs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/course/:courseId", protect, authorize("student"), async (req, res) => {
  try {
    const access = await ensureStudentAccess(req.params.courseId, req.user.id);
    if (access.error) {
      return res.status(access.status).json({ success: false, error: access.error });
    }

    const progress = await Progress.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    return res.json({
      success: true,
      data: progress || {
        student: req.user.id,
        course: req.params.courseId,
        completedMaterials: [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put(
  "/course/:courseId/material/:materialId",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const { completed } = req.body;
      const access = await ensureStudentAccess(req.params.courseId, req.user.id);

      if (access.error) {
        return res.status(access.status).json({ success: false, error: access.error });
      }

      const materialExists = access.course.materials.some(
        (material) => material._id.toString() === req.params.materialId
      );

      if (!materialExists) {
        return res.status(404).json({
          success: false,
          error: "Material not found in this course",
        });
      }

      const progress =
        (await Progress.findOne({
          student: req.user.id,
          course: req.params.courseId,
        })) ||
        new Progress({
          student: req.user.id,
          course: req.params.courseId,
          completedMaterials: [],
        });

      const materialId = req.params.materialId.toString();
      const current = progress.completedMaterials.map((item) => item.toString());

      if (completed) {
        if (!current.includes(materialId)) {
          progress.completedMaterials.push(req.params.materialId);
        }
      } else {
        progress.completedMaterials = progress.completedMaterials.filter(
          (item) => item.toString() !== materialId
        );
      }

      progress.lastViewedAt = new Date();
      progress.updatedAt = new Date();
      await progress.save();

      return res.json({
        success: true,
        message: completed
          ? "Material marked as completed"
          : "Material marked as incomplete",
        data: progress,
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
