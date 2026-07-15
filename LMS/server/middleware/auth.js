const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper to get the primary admin
const getPrimaryAdmin = async () => {
  // Get the first admin account (the primary one)
  const admins = await User.find({ role: "admin" })
    .sort({ registeredOn: 1 })
    .limit(1);
  return admins.length > 0 ? admins[0] : null;
};

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!req.user.isApproved) {
      return res.status(401).json({
        success: false,
        error: "Your account is not approved yet",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    // If user is admin, make sure they're the primary admin
    if (req.user.role === "admin") {
      const primaryAdmin = await getPrimaryAdmin();

      // If there's no primary admin, something is wrong
      if (!primaryAdmin) {
        return res.status(500).json({
          success: false,
          error: "System configuration error - no admin account found",
        });
      }

      // If this admin is not the primary admin
      if (primaryAdmin._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error:
            "Access denied. Only the primary administrator account can access this route",
        });
      }
    }

    next();
  };
};
