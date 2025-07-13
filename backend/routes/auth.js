const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  GenerateToken,
  RefreshToken,
  VerifyToken,
} = require("../common-functions/token");
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if role is valid
    if (role && !["student", "instructor"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || "student",
    });

    await user.save();

    // Generate JWT
    const token = GenerateToken(user);
    const refreshToken = RefreshToken(user);

    res.status(201).json({
      token,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = GenerateToken(user);
    const refreshToken = RefreshToken(user);

    res.json({
      token,
      refreshToken,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, "L3@rn1ng_@ppl1c@t10n_refresh");

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Generate new access token
    const newToken = GenerateToken(user);
    const newRefreshToken = RefreshToken(user);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
