const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const { createNotificationForUser } = require("../utils/notifications");

const sanitizeProfile = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  uniqueId: user.uniqueId,
  cohort: user.cohort || "",
  phone: user.phone || "",
  location: user.location || "",
  bio: user.bio || "",
  website: user.website || "",
  avatarUrl: user.avatarUrl || "",
  preferences: user.preferences || {},
  isApproved: user.isApproved,
  registeredOn: user.registeredOn,
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    return res.json({
      success: true,
      data: sanitizeProfile(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/me", protect, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "location",
      "bio",
      "website",
      "avatarUrl",
      "preferences",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    await createNotificationForUser({
      recipient: req.user.id,
      title: "Profile updated",
      message: "Your profile settings were updated successfully.",
      type: "profile",
      link: "/settings",
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: sanitizeProfile(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { role, approved, cohort, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (approved === "true") {
      query.isApproved = true;
    }

    if (approved === "false") {
      query.isApproved = false;
    }

    if (cohort) {
      query.cohort = cohort;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { uniqueId: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ registeredOn: -1, name: 1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/pending", protect, authorize("admin"), async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false })
      .select("-password")
      .sort({ registeredOn: -1 });

    res.json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/:id/approve", protect, authorize("admin"), async (req, res) => {
  try {
    const { cohort = "" } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        error: "User is already approved",
      });
    }

    if (user.role === "student" && !cohort.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please assign a cohort before approving this student",
      });
    }

    user.isApproved = true;
    if (user.role === "student") {
      user.cohort = cohort.trim();
    }
    await user.save();

    await createNotificationForUser({
      recipient: user._id,
      title: "Account approved",
      message:
        user.role === "student"
          ? `Your student account has been approved and assigned to ${user.cohort}.`
          : "Your account has been approved. You can now log in to the LMS.",
      type: "approval",
      link: "/login",
    });

    return res.json({
      success: true,
      message: "User approved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/:id/cohort", protect, authorize("admin"), async (req, res) => {
  try {
    const { cohort = "" } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    user.cohort = cohort.trim();
    await user.save();

    await createNotificationForUser({
      recipient: user._id,
      title: "Cohort updated",
      message: `Your cohort is now set to ${user.cohort || "Unassigned"}.`,
      type: "system",
      link: "/settings",
    });

    return res.json({
      success: true,
      message: "Cohort updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await user.deleteOne();

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
