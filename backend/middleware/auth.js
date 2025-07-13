const jwt = require("jsonwebtoken");
const { VerifyToken } = require("../common-functions/token");

module.exports = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req?.headers?.authorization;

    if (!authHeader) return res.status(401).json({ error: "No token provided." });

    const token = authHeader.split(" ")[1];

    try {
      const decoded = VerifyToken(token);

      // Optional: check role if required
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: "Access denied." });
      }

      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token." });
    }
  };
};
