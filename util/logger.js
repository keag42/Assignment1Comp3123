const fs = require('fs');
const path = require('path');
// Ensure the 'logs' directory exists
const logDirectory = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logFilePath = path.join(logDirectory, 'app.log');

const levelColors = {
    error: '\x1b[31m', // red
    warn: '\x1b[33m',  // yellow
    info: '\x1b[34m',  // blue
    success: '\x1b[32m' // green
};
const colorReset = '\x1b[0m';

// Helper function to write logs
const clean = value => String(value).replace(/[\r\n\t]/g, " ");

const writeLog = (level, message, req = null) => {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${clean(level).toUpperCase()}] ${clean(message)}`;

    if (req) {
        logEntry += ` | Method: ${clean(req.method)} | Path: ${clean((req.originalUrl || req.url || "").split("?")[0])}`;
    }

    logEntry += '\n';

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error("Failed to write to log file:", err);
    });

    const color = levelColors[String(level).toLowerCase()];
    console.log(color ? `${color}${logEntry.trim()}${colorReset}` : logEntry.trim());
};
// Register before express.json() so malformed JSON requests are logged too.
const requestLogger = (req, res, next) => {
    const started = process.hrtime.bigint();
    res.once('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
        const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
        writeLog(level, `Request completed | Status: ${res.statusCode} | Duration: ${durationMs.toFixed(1)}ms`, req);
    });
    next();
};

module.exports = {writeLog, requestLogger};
