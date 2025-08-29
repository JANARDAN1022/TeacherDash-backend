const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Validate required environment variables
const requiredEnvVars = ["USER_CRED_USERNAME", "USER_CRED_PASS", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Security validation
if (
  process.env.JWT_SECRET ===
  "your-super-secret-jwt-key-change-this-in-production"
) {
  console.warn(
    "⚠️  WARNING: Using default JWT_SECRET. Change this in production!"
  );
}

if (process.env.USER_CRED_PASS === "password123") {
  console.warn(
    "⚠️  WARNING: Using default password. Change this in production!"
  );
}

module.exports = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET,
  DB_FILE:
    process.env.DB_FILE || path.resolve(__dirname, "../data/teacherdash.db"),
  USER_CRED_USERNAME: process.env.USER_CRED_USERNAME,
  USER_CRED_PASS: process.env.USER_CRED_PASS,
  CORS_ORIGIN:
    process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  DEBUG: process.env.DEBUG === "true",
};
