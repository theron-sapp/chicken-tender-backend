// ./middleware/rateLimit.js
import rateLimit from "express-rate-limit";

export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // limit each IP to 5 create account requests per windowMs
  message:
    "Too many accounts created from this IP, please try again after an hour",
});
