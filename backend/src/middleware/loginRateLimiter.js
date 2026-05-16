import rateLimit from "express-rate-limit";

/**
 * Brute-force protection for POST /api/users/login
 *
 * Allows 10 attempts per IP in a 15-minute window.
 * After the limit is exceeded, the client must wait until the window resets.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max attempts per IP per window
  standardHeaders: true,     // Return rate-limit info in `RateLimit-*` headers
  legacyHeaders: false,      // Disable `X-RateLimit-*` headers

  // Custom JSON response that matches the project's error-message convention
  handler: (req, res) => {
    const retryAfterSeconds = Math.ceil(
      (req.rateLimit.resetTime - Date.now()) / 1000
    );

    return res.status(429).json({
      message:
        "Too many login attempts. Please wait before trying again.",
      retryAfterSeconds,
    });
  },
});

export default loginRateLimiter;