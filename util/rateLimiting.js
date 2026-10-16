const { rateLimit } = require('express-rate-limit');
const { writeLog } = require("./logger");

const rateLimiter = rateLimit({
    windowMs:  60 * 1000, // 1 minutes
    limit: 20,              // 20 requests per IP per window
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
        writeLog("warn", "Authentication rate limit exceeded", req);

        return res.status(429).json({
            error: "Too many authentication requests. Try again later."
        });
    }
});
module.exports = rateLimiter