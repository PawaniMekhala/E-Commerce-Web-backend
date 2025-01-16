const jwt = require("jsonwebtoken");

// Middleware to protect routes for authenticated users
const authenticateUser = (req, res, next) => {
  let token = req.cookies.token || null;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized access. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to protect admin-only routes
const authorizeAdmin = (req, res, next) => {
  authenticateUser(req, res, (authErr) => {
    if (authErr) return;

    if (!req.user || req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    next();
  });
};

module.exports = { authenticateUser, authorizeAdmin };
