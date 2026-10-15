const express = require('express');
const mongoose= require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Loads the variables
const helmet = require('helmet');

// Data Schemas
const { User, Employee } = require('./models'); //this adds the models

//VALIDATION
const {loginValidation, signUpValidation, employeeValidation, employeeIdValidation} = require('./Validation.js')

//USER - login & signup
const { login, signup } = require('./controllers/UserController.js');

//EMPLOYEE - employee CRUD
const {getEmployees, getEmployeeById} = require('./controllers/employeeController.js');
const {createEmployee} = require("./controllers/employeeController");
const {updateEmployee} = require("./controllers/employeeController");
const {deleteEmployee} = require("./controllers/employeeController");



//Logger
const {writeLog} = require('./util/logger.js')

const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT
const jwtSecret =process.env.JWT_SECRET;

//middleware
app.use(express.json());
app.use(helmet())




console.log("starting mongoose.connect")
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
        writeLog("Error", `MongoDB connection error: ${err}`)
    });


//USER API
const usrPath ="/api/v1/user"
app.post(`${usrPath}/signup`,signUpValidation, signup)
app.post(`${usrPath}/login`, loginValidation, login);


//verifying token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Not signed in / No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attaches { userId, username, ... } to the request
        next(); // User is verified, proceed to the route handler
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

//Employee API
const employeePath ="/api/v1/emp"
app.get(`${employeePath}/employees`,verifyToken, getEmployees)
app.get(`${employeePath}/employees/:eid`, verifyToken, employeeIdValidation, getEmployeeById)
app.post(`${employeePath}/employees`,verifyToken, employeeValidation, createEmployee)
app.put(`${employeePath}/employees/:eid`, verifyToken, employeeIdValidation, employeeValidation, updateEmployee)
app.delete(`${employeePath}/employees`,  verifyToken,employeeIdValidation, deleteEmployee)

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});


//TODO REMOVE this is temporary for testing
app.get(`${usrPath}/getUsers`, async (req, res)=> {
    try {
        // Find all documents in the User collection
        const users = await User.find({});


        return res.status(200).json({users});

    } catch (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: "Internal server error" });
    }

})

