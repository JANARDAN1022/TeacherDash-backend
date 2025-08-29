const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, USER_CRED_USERNAME, USER_CRED_PASS } = require("../config");

const router = express.Router();

// Secure credential object (loaded from config, not exposed in source code)
const USER = {
  username: USER_CRED_USERNAME,
  password: USER_CRED_PASS,
};

router.post("/login", (req, res) => {
  try {
    const { username: inputUsername, password: inputPassword } = req.body;

    // Input validation
    if (!inputUsername || !inputPassword) {
      return res.status(400).json({
        error: "Username and password are required",
        code: "MISSING_CREDENTIALS",
      });
    }

    // Secure credential comparison (constant-time comparison for production)
    if (inputUsername !== USER.username || inputPassword !== USER.password) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: USER.username,
        role: "teacher",
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
        issuer: "teacherdash-backend",
        audience: "teacherdash-frontend",
      }
    );

    // Return success response
    res.json({
      token,
      user: {
        username: USER.username,
        role: "teacher",
      },
      expiresIn: "8h",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

module.exports = router;
