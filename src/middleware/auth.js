const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function authMiddleware(req, res, next) {
  try {
    // Get authorization header
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    if (!authHeader) {
      return res.status(401).json({
        error: "Authorization header is required",
        code: "MISSING_AUTH_HEADER",
      });
    }

    // Parse Bearer token
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Invalid authorization header format. Use: Bearer <token>",
        code: "INVALID_AUTH_FORMAT",
      });
    }

    const token = parts[1];

    if (!token || token.trim() === "") {
      return res.status(401).json({
        error: "Token is required",
        code: "MISSING_TOKEN",
      });
    }

    try {
      // Verify JWT token
      const payload = jwt.verify(token, JWT_SECRET, {
        issuer: "teacherdash-backend",
        audience: "teacherdash-frontend",
      });

      // Validate payload structure
      if (!payload.username || !payload.role) {
        return res.status(401).json({
          error: "Invalid token payload",
          code: "INVALID_TOKEN_PAYLOAD",
        });
      }

      // Add user info to request object
      req.user = {
        username: payload.username,
        role: payload.role,
        iat: payload.iat,
      };

      // Log successful authentication (for security monitoring)
      console.log(
        `🔐 Authenticated user: ${payload.username} (${payload.role})`
      );

      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token has expired",
          code: "TOKEN_EXPIRED",
        });
      } else if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "Invalid token",
          code: "INVALID_TOKEN",
        });
      } else {
        return res.status(401).json({
          error: "Token verification failed",
          code: "TOKEN_VERIFICATION_FAILED",
        });
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Internal server error during authentication",
      code: "AUTH_INTERNAL_ERROR",
    });
  }
}

module.exports = authMiddleware;
