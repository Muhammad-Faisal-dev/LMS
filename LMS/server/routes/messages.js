const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect, authorize } = require("../middleware/auth");
const { createNotificationsForAudience } = require("../utils/notifications");

router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { title, content, targetAudience } = req.body;

    const message = await Message.create({
      title,
      content,
      sender: req.user.id,
      targetAudience,
    });

    const roles =
      targetAudience === "students"
        ? ["student"]
        : targetAudience === "teachers"
        ? ["teacher"]
        : ["student", "teacher"];

    await createNotificationsForAudience({
      roles,
      title,
      message: content,
      type: "message",
      link: targetAudience === "teachers" ? "/teacher/messages" : "/student/messages",
      metadata: { messageId: message._id, targetAudience },
    });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .populate("sender", "name");

    return res.json({
      success: true,
      count: messages.length,
      data: messages,
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

    if (req.user.role === "student") {
      query = {
        $or: [{ targetAudience: "students" }, { targetAudience: "both" }],
      };
    } else if (req.user.role === "teacher") {
      query = {
        $or: [{ targetAudience: "teachers" }, { targetAudience: "both" }],
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .populate("sender", "name");

    return res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/:id/read", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    const alreadyRead = message.readBy.find(
      (item) => item.user.toString() === req.user.id
    );

    if (!alreadyRead) {
      message.readBy.push({
        user: req.user.id,
        readAt: Date.now(),
      });

      await message.save();
    }

    return res.json({
      success: true,
      message: "Message marked as read",
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
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    await message.deleteOne();

    return res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
