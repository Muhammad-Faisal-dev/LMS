const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const {
  isValidGmailAddress,
  normalizeGmailAddress,
} = require("../utils/validators");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

const sanitizeUser = (user) => ({
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

const getNextUniqueId = async (role) => {
  if (!["student", "teacher"].includes(role)) {
    return null;
  }

  const prefix = role === "student" ? "STU" : "TCH";
  const lastUser = await User.findOne({ role, uniqueId: { $exists: true, $ne: null } })
    .sort({ uniqueId: -1 })
    .select("uniqueId");

  const currentNumber = lastUser?.uniqueId
    ? Number(lastUser.uniqueId.replace(prefix, "")) || 0
    : 0;

  return `${prefix}${String(currentNumber + 1).padStart(4, "0")}`;
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error. Please contact administrator.",
      });
    }

    if (!mongoose.connection.readyState) {
      return res.status(500).json({
        success: false,
        error: "Database connection error. Please try again later.",
      });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email, password and role",
      });
    }

    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid account role selected",
      });
    }

    if (!isValidGmailAddress(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid Gmail address (example123@gmail.com)",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = normalizeGmailAddress(email);
    const userExists = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

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

    const uniqueId = await getNextUniqueId(role);

    const user = await User.create({
      name,
      email,
      password,
      role,
      uniqueId,
      isApproved: role === "admin",
    });

    return res.status(201).json({
      success: true,
      message:
        role === "admin"
          ? "Admin account created successfully"
          : "Registration successful. Please wait for admin approval.",
      data: sanitizeUser(user),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message || "Validation failed",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Registration failed. Please try again later.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    if (!isValidGmailAddress(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid Gmail address",
      });
    }

    const normalizedEmail = normalizeGmailAddress(email);
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    if (!user.isApproved) {
      return res.status(401).json({
        success: false,
        error: "Your account is pending approval from admin",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    return res.json({
      success: true,
      token: generateToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    return res.json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
