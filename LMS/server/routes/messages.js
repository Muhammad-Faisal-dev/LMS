const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private/Admin
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    console.log("Creating new message with data:", req.body);

    const { title, content, targetAudience } = req.body;

    const message = await Message.create({
      title,
      content,
      sender: req.user.id,
      targetAudience,
    });

    console.log("Message created successfully:", message._id);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/messages/admin
// @desc    Get all messages (admin view)
// @access  Private/Admin
router.get("/admin", protect, authorize("admin"), async (req, res) => {
  try {
    console.log("Fetching all messages for admin");

    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .populate("sender", "name");

    console.log(`Found ${messages.length} messages for admin`);

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages for admin:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/messages
// @desc    Get messages for current user based on role
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    console.log(
      `Fetching messages for user: ${req.user.id}, role: ${req.user.role}`
    );

    let messages = [];
    let query = {};

    if (req.user.role === "student") {
      query = {
        $or: [{ targetAudience: "students" }, { targetAudience: "both" }],
      };
      console.log("Using student query:", query);
    } else if (req.user.role === "teacher") {
      query = {
        $or: [{ targetAudience: "teachers" }, { targetAudience: "both" }],
      };
      console.log("Using teacher query:", query);
    } else if (req.user.role === "admin") {
      // No filters for admin - they see all messages
      console.log("Admin user, fetching all messages");
    }

    messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .populate("sender", "name");

    console.log(`Found ${messages.length} messages for user ${req.user.id}`);

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages for user:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark a message as read
// @access  Private
router.put("/:id/read", protect, async (req, res) => {
  try {
    console.log(
      `Marking message ${req.params.id} as read by user ${req.user.id}`
    );

    const message = await Message.findById(req.params.id);

    if (!message) {
      console.log(`Message ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    // Check if user has already read this message
    const alreadyRead = message.readBy.find(
      (item) => item.user.toString() === req.user.id
    );

    if (!alreadyRead) {
      console.log(
        `User ${req.user.id} has not read message ${req.params.id} yet, marking as read`
      );

      message.readBy.push({
        user: req.user.id,
        readAt: Date.now(),
      });

      await message.save();
      console.log(`Message ${req.params.id} marked as read successfully`);
    } else {
      console.log(
        `User ${req.user.id} has already read message ${req.params.id}`
      );
    }

    res.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error(`Error marking message ${req.params.id} as read:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    console.log(`Deleting message ${req.params.id}`);

    const message = await Message.findById(req.params.id);

    if (!message) {
      console.log(`Message ${req.params.id} not found for deletion`);
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    await message.deleteOne();
    console.log(`Message ${req.params.id} deleted successfully`);

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting message ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
