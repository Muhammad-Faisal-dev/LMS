const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { isValidGmailAddress } = require("../utils/validators");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        // Validate that the email is a properly formatted Gmail address
        return isValidGmailAddress(value);
      },
      message: "Please enter a valid Gmail address (example123@gmail.com)",
    },
  },
  password: {
    type: String,
    required: true,
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
  isApproved: {
    type: Boolean,
    default: false,
  },
  registeredOn: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
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

// Match password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
