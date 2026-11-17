const express = require('express');
const mongoose= require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Loads the variables
const helmet = require('helmet');
const path = require('path');
const { parseEmployeeUpload } = require('./util/profilePicture');

//Rate Limiting
const rateLimiter = require('./util/rateLimiting');


//VALIDATION
const {loginValidation, signUpValidation, employeeValidation, employeeIdValidation, employeeSearchValidation} = require('./Validation.js')

//USER - login & signup
const { login, signup } = require('./controllers/userController.js');

//EMPLOYEE - employee CRUD
const {getEmployees, getEmployeeById, searchEmployee} = require('./controllers/employeeController.js');
const {createEmployee} = require("./controllers/employeeController");
const {updateEmployee} = require("./controllers/employeeController");
const {deleteEmployee} = require("./controllers/employeeController");



//Logger
const {writeLog, requestLogger} = require('./util/logger.js')

const app = express();
const PORT = process.env.PORT
const jwtSecret =process.env.JWT_SECRET;

//middleware
const allowedOrigin = process.env.CORS_ORIGIN;
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigin && allowedOrigin !== '*' && origin && origin === allowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
    if (req.method === 'OPTIONS') return allowedOrigin && allowedOrigin !== '*' && origin === allowedOrigin ? res.sendStatus(204) : res.sendStatus(403);
    next();
});
app.use(requestLogger);
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { dotfiles: 'deny', index: false, fallthrough: false, setHeaders: res => res.setHeader('X-Content-Type-Options', 'nosniff') }));




writeLog("info", "Connecting to MongoDB")
//connecting to db
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        writeLog("info","Connected to mongo")
        // Start server only after connection succeeds
        app.listen(PORT, () => {
            writeLog("info", `Server running on port ${PORT}`)
        });
    })
    .catch(err => {
        writeLog("Error", `MongoDB connection failed (${err.name})`)
    });


//USER API
const usrPath ="/api/v1/user"
app.post(`${usrPath}/signup`, rateLimiter, signUpValidation, signup)
app.post(`${usrPath}/login`, rateLimiter, loginValidation, login);


//verifying token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        writeLog("warn", "Authentication rejected: missing token", req);
        return res.status(401).json({ error: "Not signed in / No token provided" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        writeLog("info", "JWT authentication successful", req);
        req.user = decoded; // Attaches { userId, username, ... } to the request
        next(); // User is verified, proceed to the route handler
    } catch (err) {
        writeLog("warn", err.name === "TokenExpiredError" ? "Authentication rejected: expired token" : "Authentication rejected: invalid token", req);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

//Employee API
const employeePath ="/api/v1/emp"
app.get(`${employeePath}/employees`,verifyToken, getEmployees)
app.get(`${employeePath}/employees/search`, verifyToken, employeeSearchValidation, searchEmployee)
app.get(`${employeePath}/employees/:eid`, verifyToken, employeeIdValidation, getEmployeeById)
app.post(`${employeePath}/employees`,verifyToken, parseEmployeeUpload, employeeValidation, createEmployee)
app.put(`${employeePath}/employees/:eid`, verifyToken, parseEmployeeUpload, employeeIdValidation, employeeValidation, updateEmployee)
app.delete(`${employeePath}/employees`,  verifyToken,employeeIdValidation, deleteEmployee)
//verify token will make sure its signed i
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});



app.use((err, req, res, next) => {
    const malformedJson = err.type === 'entity.parse.failed';
    writeLog(malformedJson ? "warn" : "error", malformedJson ? "Malformed JSON rejected" : `Unhandled request error (${err.name})`, req);
    if (res.headersSent) return next(err);
    return res.status(malformedJson ? 400 : 500).json({
        error: malformedJson ? "Invalid JSON request body" : "Internal server error"
    });
});
