const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { isValidGmailAddress } = require("../utils/validators");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (value) {
        return isValidGmailAddress(value);
      },
      message: "Please enter a valid Gmail address (example123@gmail.com)",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "teacher", "student"],
    required: true,
  },
  uniqueId: {
    type: String,
    unique: true,
    sparse: true,
  },
  cohort: {
    type: String,
    trim: true,
    default: "",
  },
  phone: {
    type: String,
    trim: true,
    default: "",
  },
  location: {
    type: String,
    trim: true,
    default: "",
  },
  bio: {
    type: String,
    trim: true,
    default: "",
    maxlength: 500,
  },
  website: {
    type: String,
    trim: true,
    default: "",
  },
  avatarUrl: {
    type: String,
    trim: true,
    default: "",
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    assignmentAlerts: {
      type: Boolean,
      default: true,
    },
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  registeredOn: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
