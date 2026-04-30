// ==============================================
// Auth Middleware — Protects Routes
// ==============================================
// This middleware checks if the user has a valid
// JWT token. If yes, the request continues.
// If no, the request is rejected with 401.
// ==============================================

const jwt = require("jsonwebtoken");

// -----------------------------------------------
// verifyToken — Checks if the user is logged in
// -----------------------------------------------
function verifyToken(req, res, next) {
  // Step 1: Get the token from the Authorization header
  // The header looks like: "Bearer eyJhbGciOiJIUzI1NiIs..."
  const authHeader = req.headers.authorization;

  // If there is no header, the user is not logged in
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
      data: null,
    });
  }

  // Step 2: Extract the token (remove the "Bearer " part)
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Invalid token format.",
      data: null,
    });
  }

  // Step 3: Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { userId: 1, role: "admin", iat: ..., exp: ... }

    // Attach the user info to the request object
    // Now every controller can use req.user
    req.user = decoded;

    // Continue to the next middleware or controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token is invalid or expired.",
      data: null,
    });
  }
}

// -----------------------------------------------
// authorizeRoles — Checks if the user has the right role
// -----------------------------------------------
// Usage: authorizeRoles("admin") or authorizeRoles("admin", "teacher")
function authorizeRoles(...allowedRoles) {
  return function (req, res, next) {
    // req.user was set by verifyToken above
    const userRole = req.user.role;

    // Check if the user's role is in the allowed list
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
        data: null,
      });
    }

    // User has the right role — continue
    next();
  };
}

module.exports = {
  verifyToken,
  authorizeRoles,
};
