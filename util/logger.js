const fs = require('fs');
const path = require('path');
// Ensure the 'logs' directory exists
const logDirectory = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logFilePath = path.join(logDirectory, 'app.log');

// Helper function to write logs
const writeLog = (level, message, req = null) => {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (req) {
        logEntry += ` | Method: ${req.method} | Path: ${req.originalUrl} | IP: ${req.ip}`;
    }

    logEntry += '\n';

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error("Failed to write to log file:", err);
    });

    console.log(logEntry.trim());
};
module.exports ={writeLog}