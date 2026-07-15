const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const {
  isValidGmailAddress,
  normalizeGmailAddress,
} = require("../utils/validators");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("Registration request received:", { name, email, role });

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured in environment variables");
      return res.status(500).json({
        success: false,
        error: "Server configuration error. Please contact administrator.",
      });
    }

    if (!mongoose.connection.readyState) {
      console.error("MongoDB not connected - Registration failed");
      return res.status(500).json({
        success: false,
        error: "Database connection error. Please try again later.",
      });
    }

    // Validate email format (must be Gmail)
    if (!isValidGmailAddress(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid Gmail address (example123@gmail.com)",
      });
    }

    // Normalize Gmail address to ensure uniqueness
    const normalizedEmail = normalizeGmailAddress(email);

    // Check if user exists with normalized email
    const userExists = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

    // Check if role is admin and if an admin already exists
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(403).json({
          success: false,
          error:
            "Administrator account already exists. Only one admin is allowed in the system.",
        });
      }
    }

    // Generate unique ID based on role (for students and teachers)
    let uniqueId = null;
    if (role === "student" || role === "teacher") {
      const count = await User.countDocuments({ role });
      uniqueId =
        role === "student"
          ? `STU${(count + 1).toString().padStart(4, "0")}`
          : `TCH${(count + 1).toString().padStart(4, "0")}`;
    }

    // Create user (using the original email, validation will happen in the model)
    const user = await User.create({
      name,
      email,
      password,
      role,
      uniqueId,
      isApproved: role === "admin" ? true : false, // Auto-approve admin accounts
    });

    if (user) {
      res.status(201).json({
        success: true,
        message:
          role === "admin"
            ? "Admin account created successfully"
            : "Registration successful. Please wait for admin approval.",
      });
    }
  } catch (error) {
    console.error("Registration error details:", error);

    // Check if this is a validation error from Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message || "Validation failed",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Registration failed. Please try again later.",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!isValidGmailAddress(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid Gmail address",
      });
    }

    // Normalize Gmail address for lookup
    const normalizedEmail = normalizeGmailAddress(email);

    // Check for user - use case-insensitive search with normalized email
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if account is approved
    if (!user.isApproved) {
      return res.status(401).json({
        success: false,
        error: "Your account is pending approval from admin",
      });
    }

    // Match password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Create token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        uniqueId: user.uniqueId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
